import * as math from "mathjs";
import { Point } from "./Point";
import { Vector } from "./Vector";

/**
 * Enum of oriendtation of three points
 */
export enum PointOrientation
{
	CLOCKWISE = 0,
	COLINEAR = 1,
	COUNTER_CLOCKWISE = 2,
}

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

/**
 * Check orientation of three points (p1, p2, p3), following theory here:
 * See https://www.geeksforgeeks.org/orientation-3-ordered-points/ 
 * 
 * @param {Point} p1 - the first point
 * @param {Point} p2 - the second point
 * @param {Point} p3 - the third point
 */
export function getPointOrientation(p1: Point, p2: Point, p3: Point)
{
	const EPSILON = 0.00000001;
	const p1XY = p1.getPointInArray();
	const p2XY = p2.getPointInArray();
	const p3XY = p3.getPointInArray();

	const value = (p2XY[1] - p1XY[1]) * (p3XY[0] - p2XY[0]) - (p2XY[0] - p1XY[0]) * (p3XY[1] - p2XY[1]);

	return (Math.abs(value) < EPSILON) ? PointOrientation.COLINEAR : (value > EPSILON ? PointOrientation.CLOCKWISE : PointOrientation.COUNTER_CLOCKWISE);
}

/**
 * Check whether three collinear points is on the same line segment or not, following theory here:
 * https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
 * Namely, we are checking if p2 is one line p1p3
 *
 * @param {Point} p1 - point of the line segment
 * @param {Point} p2 - point to be checked
 * @param {Point} p3 - point of the line segment
 */
export function collinearPointsOnSameSegment(p1: Point, p2: Point, p3: Point)
{
	// TODO: first need to validate if three points are collinear or not
	const p1XY = p1.getPointInArray();
	const p2XY = p2.getPointInArray();
	const p3XY = p3.getPointInArray();

	const result = (p2XY[0] <= Math.max(p1XY[0], p3XY[0]) && p2XY[0] >= Math.min(p1XY[0], p3XY[0]) && p2XY[1] <= Math.max(p1XY[1], p3XY[1]) && p2XY[1] >= Math.min(p1XY[1], p3XY[1]));

	return result;
}

/**
 * Check if a point is on a certain vector or not
 *
 * @param {Vector} v - vectore we are looking at
 * @param {Point} p - point we are checking
 */
export function isPointOnVector(v: Vector, p: Point)
{
	const startPoint = v.getStartPoint();
	const endPoint = v.getEndPoint();

	const orientation = getPointOrientation(startPoint, p, endPoint);

	if (orientation === PointOrientation.COLINEAR)
	{
		return collinearPointsOnSameSegment(startPoint, p, endPoint);
	}
	else
	{
		return false;
	}
}

/**
 * Return a random hex color code
 */
export function randomHexColorCode()
{
	return '#' + '0123456789abcdef'.split('').map(function (v, i, a)
	{
		return i > 5 ? null : a[Math.floor(Math.random() * 16)]
	}).join('');
}

/**
 * Return a promise for delay
 */
export function delay(ms: number)
{
	return new Promise(res => setTimeout(res, ms));
}