import { Point, ILatLng } from "./Point";
import { Vector } from "./Vector";
import { GaodeHelper } from "./GaodeHelper";

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