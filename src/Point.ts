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

	constructor(lat: number, lng: number)
	{
		this.lat = lat;
		this.lng = lng;
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
	 * Returns the point information in the format of array: [lat, lng]
	 */
	public getPointInArray()
	{
		return [this.lat, this.lng];
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