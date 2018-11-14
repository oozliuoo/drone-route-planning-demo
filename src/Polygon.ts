import { Point, ILatLng } from "./Point";
import { Vector } from "./Vector";
import { GaodeHelper } from "./GaodeHelper";
import { getPointOrientation, collinearPointsOnSameSegment, PointOrientation, isPointOnVector } from "./utils";

enum PolygonType
{
	CONVEX = "CONVEX",
	CONCAVE = "CONCAVE",
}

interface IBound
{
	/**
	 * Center of the bound, using lat/lng pair to represent
	 */
	center: Point;

	/**
	 * Vertices of the bound, using an array of lat/lng pairs to represent
	 * the order will be NORTHWEST, NORTHEAST, SOUTHEAST, SOUTHWEST
	 */
	vertices: Point[];
}

class Polygon
{
	/**
	 * Vertices occupying this polygon
	 */
	private vertices: Point[];

	/**
	 * Type of this polygon
	 */
	private type: PolygonType;

	/**
	 * Outter bound of this polygon
	 */
	private outterBound: IBound;

	constructor(vertices: Point[])
	{
		this.vertices = vertices;
		this.setType();
		this.setOutterBound();
	}

	/**
	 * Check and set type of this polygon
	 * 
	 * Here we basically traverse each edge, and the cross product of crosseach pair of consecutive, and the calculate the dot product of
	 * this result and the norm of the plane. If the polygon is `CONVEX`, we should always get the dot product of the same sign
	 * during the whole process; otherwise, some of them will be positive and some of them will be negative
	 */
	public setType()
	{
		this.type = null;

		let previousDp;

		for (let i = 0; i < this.vertices.length; i++)
		{
			const v1 = new Vector(this.vertices[i].getPointInArray().concat([0]), this.vertices[(i + 1) % this.vertices.length].getPointInArray().concat([0]));
			const v2 = new Vector(this.vertices[(i + 1) % this.vertices.length].getPointInArray().concat([0]), this.vertices[(i + 2) % this.vertices.length].getPointInArray().concat([0]));
			const vectorN = new Vector([0, 0, 1]);

			const crossProduct = new Vector(v1.crossProduct(v2) as number[]);
			const dotProduct = crossProduct.dotProduct(vectorN);
			if (previousDp && ((previousDp > 0 && dotProduct < 0) || (previousDp < 0 && dotProduct > 0)))
			{
				this.type = PolygonType.CONCAVE;
			}

			previousDp = dotProduct;
		}
		if (!this.type)
		{
			this.type = PolygonType.CONVEX;
		}
	}

	/**
	 * Calculate and set the outter bound of this polygon
	 */
	public setOutterBound(): void
	{
		const lats = [];
		const lngs = [];
		const latlngs = this.vertices.map((v) =>
		{
			return v.getLatLng();
		});

		for (var i = 0; i < this.vertices.length; i++)
		{
			lats.push(latlngs[i].lat);
			lngs.push(latlngs[i].lng);
		}
		var maxLat = Math.max.apply(Math, lats);
		var maxLng = Math.max.apply(Math, lngs);
		var minLat = Math.min.apply(Math, lats);
		var minLng = Math.min.apply(Math, lngs);

		this.outterBound = {
			center: new Point((maxLat + minLat) / 2, (maxLng + minLng) / 2),
			vertices: [
				new Point(maxLat, minLng),
				new Point(maxLat, maxLng),
				new Point(minLat, maxLng),
				new Point(minLat, minLng),
			],
		};
	}

	/**
	 * Get number of latitudes acrossing this polygon
	 * 
	 * @param {number} space - spacing between latitudes, we use this to determin the number
	 */
	public getNumOfLatAcrossingPolygon(space: number)
	{
		var lines = parseInt((this.outterBound.vertices[0].distanceToPointOnEarth(this.outterBound.vertices[3]) / space) as any);
		var lat = (this.outterBound.vertices[0].getLatLng().lat - this.outterBound.vertices[3].getLatLng().lat) / lines;

		return {
			len: lines + 1,
			lat: lat
		}
	}

	/**
	 * Rotate a polygon for a certain degree. Basically we are doint transformation for each
	 * vertex of the polygon
	 *
	 * @param {number} degree - degree to be rotated
	 */
	public rotate(degree, center?: Point): Polygon
	{
		const result = [];

		for (var i = 0; i < this.vertices.length; i++)
		{
			const v = this.vertices[i];
			const outterBoundInPx = GaodeHelper.getInstance().latlng2px(center ? center : this.outterBound.center);
			const transformedPoint = v.transform(outterBoundInPx.x, outterBoundInPx.y, degree);

			result.push(transformedPoint);
		}

		return new Polygon(result);
	}

	/**
	 * Find a path between two point (p1 to p2) inside polygon, the rule is to not
	 * stepping out of the polygon
	 * 
	 * // TODO: need to improve tho: better to treat it as a classic graph problem, and solve it with classic A* Search algorithem
	 * 
	 * @param {Point} p1 - starting point of the path
	 * @param {Point} p2 - target point of the path
	 *
	 * @return {Point[]} array of points representing the path
	 */
	public findPathForTwoPoints(p1: Point, p2: Point): Point[]
	{
		const result: Point[] = [];

		result.push(p1);
		let tempPoint1 = new Point(p1.getLatLng().lat, p1.getLatLng().lng);

		while (!this.twoPointsCanSeeEachOther(tempPoint1, p2))
		{
			const v = this.findNearestReachableVertexForPoint(tempPoint1, p2);
			result.push(v);
			tempPoint1 = new Point(v.getLatLng().lat, v.getLatLng().lng);;
		}

		result.push(p2);

		for (let v of this.vertices)
		{
			v.setVisited(false);
		}

		return result;
	}

	/**
	 * Finds the nearest vertex that could be directly connected with a certain point
	 *
	 * @param {Point} p - point we are finding vertices for
	 * @param {Point} target - target point, used to build heuristic function for A* search
	 */
	private findNearestReachableVertexForPoint(p: Point, target: Point): Point
	{
		let minDistance = Infinity;
		let targetVertex: Point = null;

		for (let v of this.vertices)
		{
			if (v.getLatLng().lat === p.getLatLng().lat && v.getLatLng().lng === p.getLatLng().lng)
			{
				continue;
			}
			if (!v.getVisited() && this.twoPointsCanSeeEachOther(v, p))
			{
				const d = v.distanceToPointOnEarth(p) + v.distanceToPointOnEarth(target);
				if (d < minDistance)
				{
					minDistance = d;
					targetVertex = v;
				}
			}
		}

		targetVertex && targetVertex.setVisited(true);
		return targetVertex;
	}

	/**
	 * Check whether a point is inside this polygon
	 * Following: https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/
	 *
	 * @param {Point} p - the point to be checked
	 */
	public isPointInside(p: Point)
	{
		// There must be at least 3 vertices in polygon[]
		const n = this.vertices.length;
		if (n < 3) return false;

		// Create a point for line segment from p to infinite
		const extreme = new Point(p.getLatLng().lat, 1000);

		// Count intersections of the above line with sides of polygon
		let count = 0;
		let i = 0;
		do
		{
			const next = (i + 1) % n;

			const vector1 = new Vector(this.vertices[i].getPointInArray(), this.vertices[next].getPointInArray());
			if (isPointOnVector(vector1, p))
			{
				return true;
			}
			const vector2 = new Vector(p.getPointInArray(), extreme.getPointInArray());
			// Check if the line segment from 'p' to 'extreme' intersects
			// with the line segment from 'polygon[i]' to 'polygon[next]'
			if (vector1.intersectWithVector(vector2))
			{
				// If the point 'p' is colinear with line segment 'i-next',
				// then check if it lies on segment. If it lies, return true,
				// otherwise false
				if (getPointOrientation(this.vertices[i], p, this.vertices[next]) == PointOrientation.COLINEAR)
				{
					return collinearPointsOnSameSegment(this.vertices[i], p, this.vertices[next]);
				}

				count++;
			}
			i = next;
		} while (i != 0);

		// Return true if count is odd, false otherwise
		return count % 2 === 1;
	}

	/**
	 * Check if two points can see each other in this polygon
	 * 
	 * @param {Point} p1 - the first point
	 * @param {Point} p2 - the second point
	 */
	public twoPointsCanSeeEachOther(p1: Point, p2: Point)
	{
		const vector = new Vector(p1.getPointInArray(), p2.getPointInArray());

		const intersections = this.countIntersectionWithVector(vector);
		// if we see more than 2 intersections, meaning the path is blocked
		if (intersections > 2)
		{
			return false;
		}
		else
		{
			// if midpoint is inside polygon, then the path is not blocked; else otherwise
			return this.isPointInside(new Point(vector.getMid()[1], vector.getMid()[0]));
		}
	}

	/**
	 * Count num of intersections between a vector and this polygon
	 *
	 * @param {Vector} v - vector we are looking at
	 */
	public countIntersectionWithVector(v: Vector)
	{
		const n = this.vertices.length;
		const intersections: Point[] = [];

		for (let i = 0; i < n; i++)
		{
			const next = (i + 1) % n;
			const vector = new Vector(this.vertices[i].getPointInArray(), this.vertices[next].getPointInArray());

			if (vector.equal(v))
			{
				continue;
			}

			const intersection = vector.intersectWithVector(v);
			if (intersection)
			{
				let hasIntersection = false;

				intersections.forEach((i) =>
				{
					if (i.equal(intersection))
					{
						hasIntersection = true;
					}
				})

				if (!hasIntersection)
				{
					intersections.push(intersection);
				}
			}
		}

		return intersections.length;;
	}

	/**
	 * Return type of this polygon
	 */
	public getType()
	{
		return this.type;
	}

	/**
	 * Return the outter bound of this polygon
	 */
	public getOutterBound()
	{
		return this.outterBound;
	}

	/**
	 * Return all vertices of this polygon
	 */
	public getVertices()
	{
		return this.vertices;
	}
}

export
{
	IBound,
	Polygon,
	PolygonType,
};