import { Point } from "./Point";
import { Vector } from "./Vector";

enum PolygonType
{
	CONVEX = "CONVEX",
	CONCAVE = "CONCAVE",
};

class Polygon
{
	/**
	 * Vertices occupying this polygon
	 */
	private vertices: Point[];

	/**
	 * Type of this polygon
	 */
	private type: PolygonType

	constructor(vertices: Point[])
	{
		this.vertices = vertices;
		this.setType();
	}

	/**
	 * Check and set type of this polygon
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

	public getType()
	{
		return this.type;
	}
}

export
{
	Polygon,
	PolygonType,
};