import * as math from "mathjs";

/**
 * 角度转弧度
 * @param {} degrees
 */
export function degreesToRadians(degrees)
{
	return degrees * Math.PI / 180
}

/**
 * Converts radians to degree
 * 
 * @param {any} radians - radians to be converted
 */
export function radiansToDegrees(radians)
{
	return radians * 180 / Math.PI;
}

export function transform(x, y, tx, ty, deg, sx?: number, sy?: number)
{
	let degInRad = deg * Math.PI / 180;
	// if no scaling's provided, use 1 as default
	if (!sy) sy = 1;
	if (!sx) sx = 1;
	return [
		sx * ((x - tx) * Math.cos(degInRad) - (y - ty) * Math.sin(degInRad)) + tx,
		sy * ((x - tx) * Math.sin(degInRad) + (y - ty) * Math.cos(degInRad)) + ty
	];
}

export function createRotatePolygon(latlngs, bounds, rotate)
{
	var res = [];
	for (var i = 0; i < latlngs.length; i++)
	{
		var tr = transform(
			latlngs[i].lng,
			latlngs[i].lat,
			bounds.center.lng,
			bounds.center.lat,
			rotate
		);
		res.push({ lat: tr[1], lng: tr[0] });
	}
	return res
}

export function calcPointInLineWithY(p1, p2, y)
{
	var s = p1[1] - p2[1];
	var x;
	if (s)
	{
		x = (y - p1[1]) * (p1[0] - p2[0]) / s + p1[0]
	}
	else
	{
		return false
	}
	if (x > p1[0] && x > p2[0])
	{
		return false
	}
	if (x < p1[0] && x < p2[0])
	{
		return false
	}
	return [x, y]
}

/**
 * Gets a vector from two points
 */
export function getVector(p1, p2)
{
	if (p1.length === 2)
	{
		return [p2[0] - p1[0], p2[1] - p1[1]];
	}
	else if (p1.length === 3)
	{
		return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
	}
	else
	{
		return [p2[0] - p1[0], p2[1] - p1[1]];
	}
}

export function getVectorAngle(v)
{
	return Math.atan2(v[1], v[0]);
}

export function getVectorMagnitude(v)
{
	return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

export function crossProduct(v1, v2)
{
	return math.cross(v1, v2);
}

export function dotProduct(v1, v2)
{
	let result = 0;
	for (let i = 0; i < v1.length; i++)
	{
		result += v1[i] * v2[i];
	}

	return result;
}

export function createPolygonBounds(latlngs)
{
	var lats = [];
	var lngs = [];
	for (var i = 0; i < latlngs.length; i++)
	{
		lats.push(latlngs[i].lat);
		lngs.push(latlngs[i].lng);
	}
	var maxLat = Math.max.apply(Math, lats);
	var maxLng = Math.max.apply(Math, lngs);
	var minLat = Math.min.apply(Math, lats);
	var minLng = Math.min.apply(Math, lngs);
	return {
		center: {
			lat: (maxLat + minLat) / 2,
			lng: (maxLng + minLng) / 2
		},
		latlngs: [{
			lat: maxLat,
			lng: minLng//西北
		}, {
			lat: maxLat,
			lng: maxLng//东北
		}, {
			lat: minLat,
			lng: maxLng//东南
		}, {
			lat: minLat,
			lng: minLng//西南
		}]
	}
}

export function calcLatsInPolygon(rect, space)
{
	var lines = parseInt((distance(rect[0], rect[3]) / space / 2) as any);
	var lat = (rect[0].lat - rect[3].lat) / lines;
	return {
		len: lines,
		lat: lat
	}
}

/**
 *  两点之间的距离
 * @param {lat, lng} p1
 * @param {lat, lng} p2
 */
export function distance({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 })
{
	const earthRadiusKm = 6371.0088 // https://en.wikipedia.org/wiki/Earth_radius#cite_note-Moritz2000-21

	const dLat = degreesToRadians(Math.abs(lat2 - lat1))
	const dLon = degreesToRadians(Math.abs(lon2 - lon1))

	lat1 = degreesToRadians(lat1)
	lat2 = degreesToRadians(lat2)

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return earthRadiusKm * c * 1000
}