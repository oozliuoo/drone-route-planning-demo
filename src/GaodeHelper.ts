import { Point, ILatLng } from "./Point";
import { Polygon } from "./Polygon";

class GaodeHelper
{
	/**
	 * The unique Gaode map helper
	 */
	private static _helper: GaodeHelper;

	/**
	 * The map reference for Gaode, will use this to add/remove objects
	 */
	private _map: any;

	constructor(map: any)
	{
		this._map = map;
	}

	public static getInstance(map?: any): GaodeHelper
	{
		if (!this._helper)
		{
			if (!map)
			{
				throw Error("Error when initializing GaodeHelper: need a map reference");
			}

			this._helper = new GaodeHelper(map);
		}

		return this._helper;
	}

	/**
	 * Removes an object from map
	 *
	 * @param {any} obj - object to be removed
	 */
	public remove(obj: any)
	{
		this._map.remove(obj);
	}

	/**
	 * Draw a marker on a given point on Gaode Map, and return the marker
	 *
	 * @param {Point} point - the given point we are drawing a marker on
	 */
	public drawMarker(point: Point)
	{
		const marker = new AMap.Marker({
			position: [point.getLatLng().lng, point.getLatLng().lat],
		});

		this._map.add(marker);

		return marker;
	}

	/**
	 * Draws a give polygon shape on Gaoe map, and return that shape
	 *
	 * @param {Polygon} polygon - defines the polygon to be drew
	 * @param {string} fillColor - color to be filled with polygon
	 * @param {string} strokeColor - border stroke color of this polygon, optional, default is black
	 * @param {number} zIndex - zindex of this polygon, optional, default is 1
	 */
	public drawPolygon(polygon: Polygon, fillColor: string, strokeColor?: string, zIndex?: number)
	{
		const path = polygon.getVertices().map((v) =>
		{
			return new AMap.LngLat(v.getLatLng().lng, v.getLatLng().lat);
		});

		const polygonShape = new AMap.Polygon({
			path,
			fillColor: fillColor,
			strokeColor: strokeColor ? strokeColor : "black",
			borderWeight: 1,
			zIndex: zIndex ? zIndex : 1,
		});

		this._map.add(polygonShape);

		return polygonShape;
	}

	/**
	 * Draws a polyline on Gaode Map, and then return that polyline
	 *
	 * @param {Point} p1 - a point defining the polyline
	 * @param {Point} p2 - another point defining the polyline
	 * @param {string} strokeColor - the color of this line, optional, default is black
	 * @param {number} zIndex - zindex of this polyline, optional, default is 1
	 */
	public drawPolyline(p1: Point, p2: Point, strokeColor?: string, zIndex?: number)
	{
		const l = new AMap.Polyline({
			zIndex: zIndex ? zIndex : 1,
			path: [
				new AMap.LngLat(p1.getLatLng().lng, p1.getLatLng().lat),
				new AMap.LngLat(p2.getLatLng().lng, p2.getLatLng().lat),
			],
			strokeColor: strokeColor ? strokeColor : "black",
			lineJoin: "round",
		});

		this._map.add(l);
	}

	/**
	 * Convert lat/lng to pixels on map
	 * 
	 * @param {Point} p - p containing lat/lng information
	 * 
	 */
	public latlng2px(p: Point)
	{
		return this._map.lngLatToContainer(new AMap.LngLat(p.getLatLng().lng, p.getLatLng().lat))
	}

	/**
	 * Convert pixels on map to lat/lng
	 * 
	 * @param {Array} px - [lng,lat] 
	*/
	public px2latlng(px)
	{
		const result = this._map.containerToLngLat(new AMap.Pixel(px[0], px[1]));

		return new Point(result.getLat(), result.getLng());
	}
}

export
{
	GaodeHelper,
};