
const decomp = require("poly-decomp");
import { Polygon } from "./Polygon";
import { Vector } from "./Vector";
import { Point } from "./Point";
import { GaodeHelper } from "./GaodeHelper";
import { lineVisited, randomHexColorCode, delay } from "./utils";

export default class FlightRoutePlanner
{
	public static planForConvexPolygon(polygon: Polygon, space: number, rotate: number)
	{
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

	public static planForConcavePolygon(polygon: Polygon, space: number, rotate: number)
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

	public static async planForConcavePolygon2(polygon: Polygon, space: number, rotate: number, findIntersectionOnly?: boolean)
	{
		// rotate the polygon first
		const rotatedPolygon = polygon.rotate(-1 * rotate);
		// get all latitude lines crossing the rotated polygons
		const latLines = rotatedPolygon.getNumOfLatAcrossingPolygon(space);

		// try to draw the rotated polygon, one could comment this out safely
		// GaodeHelper.getInstance().drawPolygon(rotatedPolygon, "#6638F0", "#6638F0", 12);

		const rotatedPolygonVertices = rotatedPolygon.getVertices();

		let lines: Point[][] = [];
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
				continue;
			}

			if (findIntersectionOnly)
			{
				for (let p of line)
				{
					GaodeHelper.getInstance().drawMarker(p, true);
				}
			}

			lines.push(line.sort((a, b) =>
			{
				return a.getLatLng().lng === b.getLatLng().lng ? 0 : (a.getLatLng().lng < b.getLatLng().lng ? -1 : 1);
			}));
		}

		if (!findIntersectionOnly)
		{
			// TODO: Now we have all corssed lines and points in `lines`, we could work on optimal solutions with these data in hand
			let direction = true;
			let processedLines = 0;
			let n = lines.length;
			let polylines: Point[] = [];

			while (lines.length > 0)
			{
				const line = lines.shift();
				const firstTwoValidPoints = this.getFirstPairOfPoint(rotatedPolygon, polylines, line, direction);

				if (firstTwoValidPoints.length > 0)
				{

					direction = !direction;
					polylines = polylines.concat(firstTwoValidPoints);
				}

				// if the line has not been fully visited yet, push it back to the lines list
				if (!lineVisited(line))
				{
					lines.push(line);
				}

				processedLines++;

				if (processedLines === n)
				{
					processedLines = 0;
					n = lines.length;
				}
			}

			// draw lines
			const polylinesPolygon = new Polygon(polylines);
			const rotatedPolylines = polylinesPolygon.rotate(rotate, polygon.getOutterBound().center);
			const rotatedPolylinesVertices = rotatedPolylines.getVertices();
			const recordedLines = [];

			// Below are just drawing the polylines on Gaode map
			for (let i = 0; i < rotatedPolylinesVertices.length - 1; i++)
			{
				const l = GaodeHelper.getInstance().drawPolyline(rotatedPolylinesVertices[i], rotatedPolylinesVertices[i + 1], randomHexColorCode(), 12);

				GaodeHelper.getInstance().drawMarker(rotatedPolylinesVertices[i], true, i.toString());
				recordedLines.push(l);
				await delay(200);
			}

			return recordedLines;
		}

		return [];
	}

	private static getFirstPairOfPoint(polygon: Polygon, previousPoints: Point[], line: Point[], direction: boolean): Point[]
	{
		let result: Point[] = [];

		// if we haven't found any points yet, we can simply get the first two valid point from the line, since we dont need to
		// worry about connectivity problem
		if (previousPoints.length === 0)
		{
			for (let i = 0; i < line.length - 1; i += 2)
			{
				const p = direction ? line[i] : line[i + 1];
				const nextP = direction ? line[i + 1] : line[i];
				if (!p.getVisited())
				{
					result.push(p);
					result.push(nextP);

					p.setVisited(true);
					nextP.setVisited(true);

					break;
				}
			}
		}
		else
		{
			const lastPoint = previousPoints[previousPoints.length - 1];

			for (let i = 0; i < line.length - 1; i += 2)
			{
				const p = direction ? line[i] : line[i + 1];
				const nextP = direction ? line[i + 1] : line[i];

				if (!p.getVisited())
				{
					if (polygon.twoPointsCanSeeEachOther(lastPoint, p))
					{
						result.push(p);
					}
					else
					{
						const path = polygon.findPathForTwoPoints(lastPoint, p);
						result = result.concat(path.slice(1));
					}

					result.push(nextP)
					p.setVisited(true);
					nextP.setVisited(true);
					break;
				}
			}
		}

		return result;
	}
}