
const decomp = require("poly-decomp");
import { createPolygonBounds, calcLatsInPolygon, calcPointInLineWithY, createRotatePolygon } from "./utils";

export default class FlightRoutePlanner
{
	public static planForConvexPolygon(map, latLngs, space, rotate)
	{
		const bounds = createPolygonBounds(latLngs);

		const latLines = calcLatsInPolygon(bounds.latlngs, space);
		let polylines = [];

		var rPolygon = createRotatePolygon(latLngs, bounds, -rotate)
		for (var i = 0; i < latLines.len; i++)
		{
			const line = [];
			/**遍历每一个多边形顶点*/
			for (var j = 0; j < rPolygon.length; j++)
			{
				var point = calcPointInLineWithY([
					rPolygon[j].lng,
					rPolygon[j].lat,
				], [
						rPolygon[this.si(j + 1, rPolygon.length)].lng,
						rPolygon[this.si(j + 1, rPolygon.length)].lat,
					], bounds.latlngs[0].lat - i * latLines.lat)
				if (point)
				{
					line.push(point)
				}
			}

			/**去掉只有一个交点的纬度线*/
			if (line.length < 2)
			{
				continue
			}

			/**去掉两个交点重合的纬度线*/
			if (line[0][0] === line[1][0])
			{
				continue
			}
			polylines.push({ lat: line[0][1], lng: line[0][0] });
			polylines.push({ lat: line[1][1], lng: line[1][0] });
		}

		const rotatedPolylines = createRotatePolygon(polylines, bounds, rotate);

		polylines = [];
		console.log(rotatedPolylines);
		for (let i = 0; i < rotatedPolylines.length - 1; i++)
		{
			const line = rotatedPolylines[i];
			const l = new AMap.Polyline({
				zIndex: 12,
				path: [
					new AMap.LngLat(rotatedPolylines[i].lng, rotatedPolylines[i].lat),
					new AMap.LngLat(rotatedPolylines[i + 1].lng, rotatedPolylines[i + 1].lat),
				],
				strokeColor: "black",
				lineJoin: "round",
			});

			map.add(l);

			polylines.push(l);
		}

		return polylines;
	}

	public static planForConcavePolygon(map, latLngs, space, rotate)
	{
		const concavePolygon = latLngs.map((item) =>
		{
			return [item.lat, item.lng];
		});

		console.log(decomp.makeCCW(concavePolygon));
		const convexPolygons = decomp.quickDecomp(concavePolygon);

		let polylines = [];

		for (let i = 0; i < convexPolygons.length; i++)
		{
			const c = convexPolygons[i];
			polylines = polylines.concat(this.planForConvexPolygon(map, c.map((i) =>
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