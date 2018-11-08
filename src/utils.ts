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