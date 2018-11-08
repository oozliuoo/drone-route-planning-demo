<template>
	<div :class="$style.hello">
		<h1>{{ msg }}</h1>
		<div id="container" :class="$style.map">

			<el-amap vid="amapDemo" :center="[121.59996, 31.197646]" :amap-manager="amapManager" :zoom="12" :events="events" class="amap-demo">
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
		<button :class="$style.generateButton" @click="onClearClick"> Clear </button>
		<button :class="$style.generateButton" @click="drawFlightRouteClick"> Generate Flight Route </button>
	</div>
</template>

<script lang="ts">
	import { Component, Prop, Watch } from "vue-property-decorator";
	import Vue from "vue";
	import * as VueAMap from 'vue-amap';
	import { getVector, crossProduct, dotProduct, calcPointInLineWithY } from "../utils";
	import FlightRoutePlanner from "../FlightRoutePlanner";
	import { Polygon, PolygonType } from "../Polygon";
	import { Point } from "../Point";
	import { GaodeHelper } from "../GaodeHelper";

	@Component({
		name: "HelloWorld",
	})
	export default class HelloWorld extends Vue	{
		private msg = "";
		private amapManager = new VueAMap.AMapManager();
		private markerPoints: Point[] = [];
		private markers = [];
		private polygon: Polygon = null;
		private polygonType: PolygonType = null;
		private polylines = [];
		private rotate = 0;

		private space = 100;

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
			const marker = GaodeHelper.getInstance().drawMarker(markerPoint);

			this.markerPoints.push(markerPoint);
			this.markers.push(marker);
		}

		private drawFlightRouteClick()
		{
			GaodeHelper.getInstance().remove(this.polylines);

			if (!this.polygon || !this.polygonType)
			{
				alert("Please draw a polygon first");

				return;
			}

			if (this.polygonType === PolygonType.CONVEX)
			{
				this.polylines = FlightRoutePlanner.planForConvexPolygon(this.polygon, this.space, this.rotate);
			}
			else
			{
				this.polylines = FlightRoutePlanner.planForConcavePolygon(this.polygon, this.space, this.rotate);
			}
		}

		private onGeneratePolygonClick()
		{
			if (this.markers.length < 3)
			{
				alert("Please mark at least three markers on the map");

				return;
			}

			if (this.polygon)
			{
				alert("Already has a polygon, please remove first");

				return;
			}

			// detect polygon types
			this.polygon = new Polygon(this.markerPoints);
			this.polygonType = this.polygon.getType();

			// Draw polygon, and remove markers
			GaodeHelper.getInstance().drawPolygon(this.polygon, "#F78AE0", "#F78AE0", 11);
			this.markers.forEach((m) =>
			{
				GaodeHelper.getInstance().remove(m);
			})
			this.markers.length = 0;
		}

		private onClearClick()
		{
			this.markers.forEach((m) =>
			{
				GaodeHelper.getInstance().remove(m);
			})

			GaodeHelper.getInstance().remove(this.polygon);
			GaodeHelper.getInstance().remove(this.polylines);
			this.polygon = null;
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
