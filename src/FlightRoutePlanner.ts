
const decomp = require("poly-decomp");
import { createPolygonBounds, calcLatsInPolygon, calcPointInLineWithY, createRotatePolygon } from "./utils";
import { Polygon } from "./Polygon";
import { Vector } from "./Vector";
import { Point } from "./Point";
import { GaodeHelper } from "./GaodeHelper";

export default class FlightRoutePlanner
{
	public static planForConvexPolygon(polygon: Polygon, space: number, rotate: number)
	{
		const bounds = polygon.getOutterBound();
		const latLines = polygon.getNumOfLatAcrossingPolygon(space);

		const rotatedPolygon = rotate !== 0 ? polygon.rotate(-rotate) : polygon;

		const polylines: Point[] = [];

		const rotatedPolygonVertices = rotatedPolygon.getVertices();
		for (var i = 0; i < latLines.len; i++)
		{
			const line = [];
			// tranverse all vertices on the rotated polygon
			for (var j = 0; j < rotatedPolygonVertices.length; j++)
			{
				const vertex1 = rotatedPolygonVertices[j];
				const vertex2 = rotatedPolygonVertices[j % rotatedPolygonVertices.length];
				const vector = new Vector(vertex1.getPointInArray(), vertex2.getPointInArray());
				const point = vector.getPointOnVectorWithY(bounds.vertices[0].getLatLng().lat - i * latLines.lat);

				if (point)
				{
					line.push(point)
				}
			}

			// ignore if the line only intercects the polygon with one single point,
			// or both points are the same
			// TODO: more corner cases?
			if (line.length < 2 || line[0][0] === line[1][0])
			{
				continue
			}

			polylines.push(i % 2 === 0 ? line[0] : line[1]);
			polylines.push(i % 2 === 0 ? line[1] : line[0]);
		}

		const rotatedPolylines = new Polygon(polylines).rotate(rotate);
		const rotatedPolylinesVertices = rotatedPolylines.getVertices();
		const recordedLines = [];

		// Below are just drawing the polylines on Gaode map
		for (let i = 0; i < rotatedPolylinesVertices.length - 1; i++)
		{
			const p1 = new Point(rotatedPolylinesVertices[i].getLatLng().lat, rotatedPolylinesVertices[i].getLatLng().lng);
			const p2 = new Point(rotatedPolylinesVertices[i + 1].getLatLng().lat, rotatedPolylinesVertices[i + 1].getLatLng().lng);

			const l = GaodeHelper.getInstance().drawPolyline(p1, p2);

			recordedLines.push(l);
		}

		return recordedLines;
	}

	public static planForConcavePolygon(latLngs, space, rotate)
	{
		const concavePolygon = latLngs.map((item) =>
		{
			return [item.lat, item.lng];
		});

		const convexPolygons = decomp.quickDecomp(concavePolygon);

		let polylines = [];

		for (let i = 0; i < convexPolygons.length; i++)
		{
			const c = convexPolygons[i];
			polylines = polylines.concat(this.planForConvexPolygon(c.map((i) =>
			{
				return {
					lat: i[0],
					lng: i[1],
				}
			}), space, rotate));
		}

		return polylines;
	}



	/**防止索引溢出*/
	private static si(i, l)
	{
		if (i > l - 1)
		{
			return i - l;
		}
		if (i < 0)
		{
			return l + i;
		}
		return i;
	}
}