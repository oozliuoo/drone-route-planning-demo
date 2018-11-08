import * as math from "mathjs";
import { Point } from "./Point";

/**
 * Representing a single vector
 */
class Vector
{
	private start: number[];

	private end: number[];

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

		return ((x > this.start[0] && x > this.end[0]) || (x < this.start[0] && x < this.end[0])) ? null : new Point(x, y);
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
}

export
{
	Vector,
};