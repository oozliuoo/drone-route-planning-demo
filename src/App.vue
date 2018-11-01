<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script lang="ts">
	import { Component, Prop, Watch } from "vue-property-decorator";
	import Vue from "vue";

	@Component({
		name: "App",
	})
	export default class App extends Vue
	{

	}
</script>

<style lang="postcss" module>
	#app {
		font-family: "Avenir", Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}
</style>
