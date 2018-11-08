import * as math from "mathjs";
import { Point } from "./Point";

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

/**
 * Check if a line of points has been visited completely or not
 *
 * @param {Point[]} line - line to be checked
 */
export function lineVisited(line: Point[])
{
	for (let p of line)
	{
		if (!p.getVisited())
		{
			return false;
		}
	}

	return true;
}