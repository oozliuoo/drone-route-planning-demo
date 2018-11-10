<template>
	<div :class="$style.hello">
		<h1>{{ msg }}</h1>
		<div id="container" :class="$style.map">

			<el-amap vid="amapDemo" :center="[121.59996, 31.197646]" :amap-manager="amapManager" :zoom="17" :events="events" class="amap-demo">
			</el-amap>
		</div>
		<h3 v-if="polygonType">{{ polygonType === "CONCAVE" ? "凹多边形" : "凸多边形" }}</h3>
		<div :class="$style.inputs">
			<div :class="$style.inputWrapper">
				<h4>Spacing Between lines</h4>
				<input v-model="space" @change="drawFlightRouteClick" />
				<h4> {{ `Current spacing: ${space}`}}</h4>
			</div>
			<div :class="$style.inputWrapper">
				<h4>Line Rotate</h4>
				<input v-model="rotate" @change="drawFlightRouteClick" />
				<h4> {{ `Current rotate: ${rotate}`}}</h4>
			</div>
		</div>
		<button :class="$style.generateButton" @click="onGeneratePolygonClick"> Generate Polygon </button>
		<button :class="$style.generateButton" @click="onGenerateLineSegmentClick"> Generate Line Segment </button>
		<button :class="$style.generateButton" @click="onCheckIntersectionClick"> Check Polygon and line intersect </button>
		<button :class="$style.generateButton" @click="onCheckTwoPointSeeEachOtherClick"> Check two points can see each other </button>
		<button :class="$style.generateButton" @click="onCheckPointInPolygonClick"> Check point in polygon </button>
		<button :class="$style.generateButton" @click="onCheckFindPathInPolygonClick"> Check find path in polygon </button>
		<button :class="$style.generateButton" @click="onCheckIntersectionPointClick"> Check intersection </button>
		<button :class="$style.generateButton" @click="onClearClick"> Clear </button>
		<button :class="$style.generateButton" @click="drawFlightRouteClick"> Generate Flight Route </button>
		<button :class="$style.generateButton" @click="drawFlightRouteIntersectionClick"> Generate Flight Route, intersection only </button>
	</div>
</template>

<script lang="ts">
	import { Component, Prop, Watch } from "vue-property-decorator";
	import Vue from "vue";
	import * as VueAMap from 'vue-amap';
	import FlightRoutePlanner from "../FlightRoutePlanner";
	import { Polygon, PolygonType } from "../Polygon";
	import { Point } from "../Point";
	import { GaodeHelper } from "../GaodeHelper";
	import { Vector } from "../Vector";

	@Component({
		name: "HelloWorld",
	})
	export default class HelloWorld extends Vue	{
		private msg = "";
		private amapManager = new VueAMap.AMapManager();
		private markerPoints: Point[] = [];
		private markers = [];
		private polygonShape = null;
		private polygon: Polygon = null;
		private polygonType: PolygonType = null;
		private polylines = [];
		private rotate = "0";
		private polyline: Vector = null;
		private polyline2: Vector = null;
		private polylineShape = null;

		private space = 30;

		mounted()
		{
		}

		get events()
		{
			const self = this;

			return {
				init(o)
				{
					GaodeHelper.getInstance(o);

					o.on("click", self.onMapClick);
				}
			}
		}

		private onMapClick(e)
		{
			const lnglat = e.lnglat;

			// define point, and draw it
			const markerPoint = new Point(lnglat.lat, lnglat.lng);
			const marker = GaodeHelper.getInstance().drawMarker(markerPoint, true);

			this.markerPoints.push(markerPoint);
			this.markers.push(marker);
		}

		private async drawFlightRouteClick()
		{
			GaodeHelper.getInstance().remove(this.polylines);

			if (!this.polygon || !this.polygonType)
			{
				alert("Please draw a polygon first");

				return;
			}

			if (this.polygonType === PolygonType.CONVEX)
			{
				this.polylines = FlightRoutePlanner.planForConvexPolygon(this.polygon, this.space, parseInt(this.rotate));
			}
			else
			{
				this.polylines = await FlightRoutePlanner.planForConcavePolygon2(this.polygon, this.space, parseInt(this.rotate));
			}
		}

		private async drawFlightRouteIntersectionClick()
		{

			if (!this.polygon || !this.polygonType)
			{
				alert("Please draw a polygon first");

				return;
			}

			if (this.polygonType === PolygonType.CONVEX)
			{
				this.polylines = FlightRoutePlanner.planForConvexPolygon(this.polygon, this.space, parseInt(this.rotate));
			}
			else
			{
				this.polylines = await FlightRoutePlanner.planForConcavePolygon2(this.polygon, this.space, parseInt(this.rotate), true);
			}
		}

		private onCheckPointInPolygonClick()
		{
			if (!this.polygon || !this.polyline)
			{
				alert("Need to generate a polygon and a polyline first");
			}

			alert(this.polygon.isPointInside(this.polyline.getStartPoint()));
		}

		private onCheckTwoPointSeeEachOtherClick()
		{
			if (!this.polygon)
			{
				alert("Need to at least have one polygon, and a polyline to check");
				return;
			}

			/*
			const p1 = this.polygon.getVertices()[0];
			const p2 = this.polygon.getVertices()[1];
			alert(this.polygon.twoPointsCanSeeEachOther(p1, p2));
			 */

			for (let i = 0; i < this.polygon.getVertices().length; i++)
			{
				const p1 = this.polygon.getVertices()[i];
				const p2 = this.polygon.getVertices()[(i + 1) % this.polygon.getVertices().length];

				console.log(p1.getLatLng());
				console.log(p2.getLatLng());
				console.log(this.polygon.twoPointsCanSeeEachOther(p1, p2));
			}
		}

		private onCheckFindPathInPolygonClick()
		{
			if (!this.polygon || !this.polyline)
			{
				alert("Need at least one polygon and one polyline on the map");
				return;
			}

			const result = this.polygon.findPathForTwoPoints(this.polyline.getStartPoint(), this.polyline.getEndPoint());

			let i = 0;
			result.map((p) =>
			{
				GaodeHelper.getInstance().drawMarker(p, true, i.toString());
				i++;
			});
		}

		private onCheckIntersectionPointClick()
		{
			if (!this.polyline || !this.polyline2)
			{
				alert("Need two polylines");
			}

			const point = this.polyline.intersection(this.polyline2);

			if (!point)
			{
				alert("Not intersected");
			}
			else
			{
				GaodeHelper.getInstance().drawMarker(point);
			}
		}

		private onCheckIntersectionClick()
		{
			if (!this.polygon || !this.polyline)
			{
				alert("Need at least one polygon and one polyline on the map");
				return;
			}

			alert(this.polygon.countIntersectionWithVector(this.polyline));
		}

		private onGenerateLineSegmentClick()
		{
			if (this.markers.length !== 2)
			{
				alert("Please only pin two markers");
				return;
			}

			if (this.polyline)
			{
				this.polyline2 = new Vector(this.markerPoints[0].getPointInArray(), this.markerPoints[1].getPointInArray());
				GaodeHelper.getInstance().drawPolyline(this.markerPoints[0], this.markerPoints[1], "#000000", 13);
			}
			else
			{
				this.polyline = new Vector(this.markerPoints[0].getPointInArray(), this.markerPoints[1].getPointInArray());
				this.polylineShape = GaodeHelper.getInstance().drawPolyline(this.markerPoints[0], this.markerPoints[1], "#000000", 13);
			}

			this.markers.length = 0;
			this.markerPoints.length = 0;
		}

		private onGeneratePolygonClick()
		{
			if (this.markers.length < 3)
			{
				alert("Please mark at least three markers on the map");

				return;
			}

			if (this.polygonShape)
			{
				alert("Already has a polygon, please remove first");

				return;
			}

			// detect polygon types
			this.polygon = new Polygon([].concat(this.markerPoints));
			this.polygonType = this.polygon.getType();

			// Draw polygon, and remove markers
			this.polygonShape = GaodeHelper.getInstance().drawPolygon(this.polygon, "#F78AE0", "#F78AE0", 11);

			this.markers.length = 0;
			this.markerPoints.length = 0;
		}

		private onClearClick()
		{
			this.markers.forEach((m) =>
			{
				GaodeHelper.getInstance().remove(m);
			})

			GaodeHelper.getInstance().remove(this.polygonShape);
			GaodeHelper.getInstance().remove(this.polylines);
			this.polygonShape = null;
			this.polygonType = null;
			this.polylines = [];
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="postcss" module>
	h1,
	h2 {
		font-weight: normal;
	}
	ul {
		list-style-type: none;
		padding: 0;
	}
	li {
		display: inline-block;
		margin: 0 10px;
	}
	a {
		color: #42b983;
	}

	.hello {
		& .map {
			width: 100%;
			height: 500px;
		}

		& .inputs {
			display: flex;
			flex-direction: row;

			& .inputWrapper {
				display: flex;
				flex-direction: column;
				margin-left: 50px;
			}
		}

		& button {
			margin-top: 20px;
		}
	}
</style>
