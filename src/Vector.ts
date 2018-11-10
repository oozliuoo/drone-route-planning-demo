import * as math from "mathjs";
import { Point } from "./Point";
import { getPointOrientation, collinearPointsOnSameSegment, PointOrientation, isPointOnVector } from "./utils";

/**
 * Representing a single vector
 */
class Vector
{
	private start: number[];

	private end: number[];

	private midpoint: number[] = [];

	constructor(start: number[], end?: number[])
	{
		if (start && start.length > 0 && (!end || end.length === 0))
		{
			this.end = start;
			this.start = [];
			this.end.forEach((i) =>
			{
				this.start.push(0);
			});

			return;
		}

		if (start.length <= 0 || end.length <= 0 || start.length !== end.length)
		{
			throw Error("Invalid vector");
		}
		this.start = start;
		this.end = end;

		for (let i = 0; i < this.start.length; i++)
		{
			this.midpoint.push((this.start[i] + this.end[i]) / 2);
		}
	}

	/**
	 * Return the nuneric value of this vector in the form of an array
	 */
	public value()
	{
		const result = [];

		for (let i = 0; i < this.start.length; i++)
		{
			result.push(this.end[i] - this.start[i]);
		}

		return result;
	}

	/**
	 * Returns dot product with another vector
	 */
	public dotProduct(v: Vector)
	{
		if (this.dimension() !== v.dimension())
		{
			throw Error("Vector needs to have the same dimensions in order to perform dot product");
		}
		let result = 0;
		for (let i = 0; i < this.dimension(); i++)
		{
			result += this.value()[i] * v.value()[i];
		}

		return result;
	}

	public intersection(v: Vector): Point
	{
		// Represent v as a1x + b1y = c1
		const a1 = v.getEnd()[1] - v.getStart()[1];
		const b1 = v.getStart()[0] - v.getEnd()[0];
		const c1 = a1 * (v.getStart()[0]) + b1 * (v.getStart()[1]);

		// Represent this vector as a2x + b2y = c2
		const a2 = this.getEnd()[1] - this.getStart()[1];
		const b2 = this.getStart()[0] - this.getEnd()[0];
		const c2 = a2 * (this.getStart()[0]) + b2 * (this.getStart()[1]);

		const determinant = a1 * b2 - a2 * b1;

		if (determinant == 0)
		{
			// The lines are parallel. This is simplified
			// by returning null
			return null
		}
		else
		{
			const x = (b2 * c1 - b1 * c2) / determinant;
			const y = (a1 * c2 - a2 * c1) / determinant;
			return new Point(y, x);
		}
	}

	/**
	 * Check if a vector is equivalent to this vector
	 *
	 * @param {Vector} v - the other vector
	 */
	public equal(v: Vector)
	{
		return (this.getStartPoint().equal(v.getStartPoint()) && this.getEndPoint().equal(v.getEndPoint()))
			|| (this.getEndPoint().equal(v.getStartPoint()) && this.getStartPoint().equal(v.getEndPoint()));
	}

	/**
	 * Get cross product with another vector
	 */
	public crossProduct(v: Vector)
	{
		if (this.dimension() !== v.dimension())
		{
			throw Error("Vector needs to have the same dimensions in order to perform cross product");
		}
		return math.cross(this.value(), v.value());
	}

	/**
	 * Given a y coordinate, get the point on it with that y
	 *
	 * @param {number} y - the given y coordinate
	 */
	public getPointOnVectorWithY(y: number)
	{
		const s = this.start[1] - this.end[1];
		let x;
		if (s)
		{
			x = (y - this.start[1]) * (this.start[0] - this.end[0]) / s + this.start[0]
		}
		else
		{
			return null
		}

		return ((x > this.start[0] && x > this.end[0]) || (x < this.start[0] && x < this.end[0])) ? null : new Point(y, x);
	}

	/**
	 * Check if two vector intersects with each other or not, this is only for 2-dimensions
	 *
	 * @param {Vector} v - vector to be checked against `this` vector
	 */
	public intersectWithVector(v: Vector)
	{
		if (this.dimension() !== 2 || v.dimension() !== 2)
		{
			throw new Error("Only checking 2-dimensions vectors' intersection");
		}

		const p1 = new Point(this.start[1], this.start[0]);
		const q1 = new Point(this.end[1], this.end[0]);
		const p2 = new Point(v.getStart()[1], v.getStart()[0]);
		const q2 = new Point(v.getEnd()[1], v.getEnd()[0]);
		// Find the four orientations needed for general and
		// special cases
		const o1 = getPointOrientation(p1, q1, p2);
		const o2 = getPointOrientation(p1, q1, q2);
		const o3 = getPointOrientation(p2, q2, p1);
		const o4 = getPointOrientation(p2, q2, q1);

		let result = false;

		if ((isPointOnVector(v, p1) && isPointOnVector(v, q1)) || (isPointOnVector(this, p2) && isPointOnVector(this, q2)))
		{
			return null;
		}
		// General case
		else if (o1 != o2 && o3 != o4)
		{
			result = true;
		}

		// Special Cases
		// p1, q1 and p2 are colinear and p2 lies on segment p1q1
		else if (o1 == PointOrientation.COLINEAR && collinearPointsOnSameSegment(p1, p2, q1)) result = true;

		// p1, q1 and q2 are colinear and q2 lies on segment p1q1
		else if (o2 == PointOrientation.COLINEAR && collinearPointsOnSameSegment(p1, q2, q1)) result = true;

		// p2, q2 and p1 are colinear and p1 lies on segment p2q2
		else if (o3 == PointOrientation.COLINEAR && collinearPointsOnSameSegment(p2, p1, q2)) result = true;

		// p2, q2 and q1 are colinear and q1 lies on segment p2q2
		else if (o4 == PointOrientation.COLINEAR && collinearPointsOnSameSegment(p2, q1, q2)) result = true;

		if (result)
		{
			return this.intersection(v);
		}
		else
		{
			return null;
		}
	}

	/**
	 * Returns dimension of this vector
	 */
	public dimension()
	{
		return this.start.length;
	}

	/**
	 * Returns the start point of this vector
	 */
	public getStart()
	{
		return this.start;
	}

	/**
	 * Returns the end point of this vector
	 */
	public getEnd()
	{
		return this.end;
	}

	/**
	 * Returns the `midpoint` of this vector
	 */
	public getMid()
	{
		return this.midpoint;
	}

	public getStartPoint()
	{
		return new Point(this.start[1], this.start[0]);
	}

	public getEndPoint()
	{
		return new Point(this.end[1], this.end[0]);
	}

	public getMidPoint()
	{
		return new Point(this.midpoint[1], this.midpoint[0])
	}
}

export
{
	Vector,
};