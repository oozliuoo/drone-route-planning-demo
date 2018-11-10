import { degreesToRadians } from "./utils";
import { GaodeHelper } from "./GaodeHelper";

/**
 * Representing a point in Earth Coordinate
 */
class Point
{
	/**
	 * Latitude of this point
	 */
	private lat: number;

	/**
	 * Longitude of this point
	 */
	private lng: number;

	/**
	 * Whether the point has been visited or not
	 */
	private visited: boolean;

	constructor(lat: number, lng: number)
	{
		this.lat = lat;
		this.lng = lng;
		this.visited = false;
	}

	/**
	 * Returns the point in lat/lng pair format
	 */
	public getLatLng(): ILatLng
	{
		return {
			lat: this.lat,
			lng: this.lng,
		};
	}

	/**
	 * Transform a point geographically, and return the resulting new point
	 * 
	 * @param {number} centerX - x coordinate of the center we are rotating against
	 * @param {number} centerY - y coordinate of the center we are rotating against
	 * @param {number} deg - degree we are about to transform(rotate) the point
	 */
	public transform(centerX: number, centerY: number, deg: number, scaleX?: number, scaleY?: number): Point
	{
		let degInRad = deg * Math.PI / 180;
		// if no scaling's provided, use 1 as default
		if (!scaleY) scaleY = 1;
		if (!scaleX) scaleX = 1;

		const latlngInPx = GaodeHelper.getInstance().latlng2px(new Point(this.lat, this.lng));
		return GaodeHelper.getInstance().px2latlng([
			scaleX * ((latlngInPx.x - centerX) * Math.cos(degInRad) - (latlngInPx.y - centerY) * Math.sin(degInRad)) + centerX,
			scaleY * ((latlngInPx.x - centerX) * Math.sin(degInRad) + (latlngInPx.y - centerY) * Math.cos(degInRad)) + centerY,
		])
	}

	/**
	 * Returns the point information in the format of array: [lng, lat] representing (x, y)
	 */
	public getPointInArray()
	{
		return [this.lng, this.lat];
	}

	/**
	 * Returns physical distance to another point
	 * 
	 * @param {Point} p - point we are calculating distance against
	 */
	public distanceToPointOnEarth(p: Point)
	{
		const EARTH_RADIUS_KM = 6371.0088 // https://en.wikipedia.org/wiki/Earth_radius#cite_note-Moritz2000-21

		const dLat = degreesToRadians(Math.abs(this.lat - p.getLatLng().lat));
		const dLon = degreesToRadians(Math.abs(this.lng - p.getLatLng().lng));

		const lat1 = degreesToRadians(this.lat)
		const lat2 = degreesToRadians(p.getLatLng().lat);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return EARTH_RADIUS_KM * c * 1000;
	}

	public setVisited(visited: boolean)
	{
		this.visited = visited;
	}

	public getVisited()
	{
		return this.visited;
	}

	public equal(p: Point)
	{
		const EPSILON = 0.0000001;
		return (p.getLatLng().lat - this.lat < EPSILON) && (p.getLatLng().lng - this.lng < EPSILON);
	}
}

/**
 * Interface of a lat/lng pair
 */
interface ILatLng
{
	/**
	 * Latitude
	 */
	lat: number;

	/**
	 * Longitude
	 */
	lng: number;
}

export
{
	ILatLng,
	Point,
};