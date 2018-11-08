
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
		const rotatedPolygon = polygon.rotate(-1 * rotate);
		const latLines = rotatedPolygon.getNumOfLatAcrossingPolygon(space);


		// try to draw the rotated polygon
		// GaodeHelper.getInstance().drawPolygon(rotatedPolygon, "#6638F0", "#6638F0", 12);

		const polylines: Point[] = [];

		const rotatedPolygonVertices = rotatedPolygon.getVertices();
		for (var i = 0; i < latLines.len; i++)
		{
			const line: Point[] = [];
			// tranverse all vertices on the rotated polygon
			for (var j = 0; j < rotatedPolygonVertices.length; j++)
			{
				const vertex1 = rotatedPolygonVertices[j];
				const vertex2 = rotatedPolygonVertices[(j + 1) % rotatedPolygonVertices.length];
				const vector = new Vector(vertex1.getPointInArray(), vertex2.getPointInArray());
				const point = vector.getPointOnVectorWithY(rotatedPolygon.getOutterBound().vertices[0].getLatLng().lat - i * latLines.lat);

				if (point)
				{
					line.push(point)
				}
			}

			// ignore if the line only intercects the polygon with one single point,
			// or both points are the same
			// TODO: more corner cases?
			if (line.length < 2 || (line[0].getLatLng().lat === line[1].getLatLng().lat && line[0].getLatLng().lng === line[1].getLatLng().lng))
			{
				continue
			}

			polylines.push(i % 2 === 0 ? line[0] : line[1]);
			polylines.push(i % 2 === 0 ? line[1] : line[0]);
		}

		const polylinesPolygon = new Polygon(polylines);
		const rotatedPolylines = polylinesPolygon.rotate(rotate, polygon.getOutterBound().center);
		const rotatedPolylinesVertices = rotatedPolylines.getVertices();
		const recordedLines = [];

		// Below are just drawing the polylines on Gaode map
		for (let i = 0; i < rotatedPolylinesVertices.length - 1; i++)
		{
			const l = GaodeHelper.getInstance().drawPolyline(rotatedPolylinesVertices[i], rotatedPolylinesVertices[i + 1], null, 12);

			recordedLines.push(l);
		}

		return recordedLines;
	}

	public static planForConcavePolygon(polygon: Polygon, space, rotate)
	{
		const latLngs = polygon.getVertices().map((v) =>
		{
			return v.getLatLng();
		});
		const concavePolygon = latLngs.map((item) =>
		{
			return [item.lng, item.lat];
		});

		const convexPolygons = decomp.quickDecomp(concavePolygon);

		let polylines = [];

		for (let i = 0; i < convexPolygons.length; i++)
		{
			const c = convexPolygons[i];
			const vertices = c.map((i) =>
			{
				return new Point(i[1], i[0]);
			});
			const convexPolygon = new Polygon(vertices);
			// GaodeHelper.getInstance().drawPolygon(convexPolygon, "#6638F0", "#000000", 12);
			polylines = polylines.concat(this.planForConvexPolygon(convexPolygon, space, rotate));
		}

		return polylines;
	}
}