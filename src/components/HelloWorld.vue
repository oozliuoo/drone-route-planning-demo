<template>
	<div :class="$style.hello">
		<h1>{{ msg }}</h1>
		<div id="container"
		     :class="$style.map">

			<el-amap vid="amapDemo"
			         :center="[121.59996, 31.197646]"
			         :amap-manager="amapManager"
			         :zoom="12"
			         :events="events"
			         class="amap-demo">
			</el-amap>
		</div>
		<button :class="$style.generateButton"
		        @click="onGeneratePolygonClick"> Generate Polygon </button>
		<button :class="$style.generateButton"
		        @click="onClearClick"> Clear </button>
	</div>
</template>

<script lang="ts">
	import { Component, Prop, Watch } from "vue-property-decorator";
	import Vue from "vue";
	import * as VueAMap from 'vue-amap';

	@Component({
		name: "HelloWorld",
	})
	export default class HelloWorld extends Vue	{
		private msg = "Welcome to Your Vue.js App";
		private amapManager = new VueAMap.AMapManager();
		private map: any;
		private markers = [];
		private polygon = null;

		mounted()
		{
		}

		get events()
		{
			const self = this;

			return {
				init(o)
				{
					self.map = o;

					o.on("click", self.onMapClick);
				}
			}
		}

		private onMapClick(e)
		{
			const lnglat = e.lnglat;
			const marker = new AMap.Marker({
				position: [lnglat.lng, lnglat.lat]
			});
			this.map.add(marker);

			this.markers.push(marker);
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

			const path = this.markers.map((m) =>
			{
				return new AMap.LngLat(m.getPosition().getLng(), m.getPosition().getLat());
			});

			console.log(path)
			this.polygon = new AMap.Polygon({
				path,
				fillColor: "#F78AE0",
				strokeColor: "#F78AE0",
				borderWeight: 1,
			});
			console.log(this.polygon.getOptions())
			console.log(this.polygon.getBounds())

			this.map.add(this.polygon);
			this.markers.forEach((m) =>
			{
				this.map.remove(m);
			})
			this.markers.length = 0;
		}

		private onClearClick()
		{
			const self = this;

			this.markers.forEach((m) =>
			{
				self.map.remove(m);
			})

			self.map.remove(this.polygon);
			this.polygon = null;
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

		& button {
			margin-top: 20px;
		}
	}
</style>
