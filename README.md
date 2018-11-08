# demo

> A Vue.js project

## Build Setup

```bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn dev
```

## Getting Started

run the following command and navigate to `localhost:8080` to view the page

## Project Structure

### Point

Defines a single point and related operations.

Related operations include:

1. `transform`: rotate a point against a certain center
2. `distanceToPointOnEarth`: physical distance to another point on earth

### Polygon

Defines a polygon (a series of `Point`), and related operations

Related operations include:

1. `setType`: detect type of the polygon (either `CONVEX` or `CONCAVE`), and set it internally
2. `setOutterBound`: detect the outter bound of the polygon (外接四边形), and set it internally
3. `getNumOfLatAcrossingPolygon`: get the number of latitudes intersecting with the polygon, and the latitude difference between each latitude
4. `rotate`: rotates the polygon, basicall rotating each vertex of the polygon

## Vector

Defines a vector with two points, and related operations

Related operations include:

1. `dotProduct`: dot product with another vector
2. `crossProduct`: cross product with another vector
3. `getPointOnVectorWithY`: get the point located on this vector with a specific `y`

## FlightRouterPlanner

The main file for route planner, now we have three methods here:

1. `planForConvexPolygon`: path planning for convex polygon
2. `planForConcavePolygon`: path planning for concave polygon: first decompose the concave polygon into multiple convex polygons, and then execute `planForConvexPolygon` against each resulted convex polygons
3. `planForConcavePolygon2`: any other research/demo for optimal solution can go here.

## GaodeHelper

Helper to draw different objects on gaode map

Detail can be viewed in class method

## utils

Some utility functions go here

## Implement `CONCAVE` part

`CONVEX` polygon situation has been handled already, we need to implement optimal algirithm for `CONCAVE` polygons

To work on it, one could start looking at `planForConcavePolygon2` method in `FlightRouterPlanner`
