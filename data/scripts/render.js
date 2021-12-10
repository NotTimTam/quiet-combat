"use strict";

class Renderer {
	constructor() {
		// Create canvas element.
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");

		// Canvas resizing.
		this.resolution = 9;
		this.resize();
		let boundResize = this.resize.bind(this);
		window.addEventListener("resize", boundResize);

		// Props.
		this.devStats = {
			fps: 0,
		};
	}

	// Calculate and draw the fps.
	fps() {
		if (!this.devStats.lastCall) {
			this.devStats.lastCall = Date.now();
			this.devStats.fps = 0;
		} else {
			let delta = (Date.now() - this.devStats.lastCall) / 1000;
			this.devStats.lastCall = Date.now();
			this.devStats.fps = 1 / delta;
		}

		if (!document.querySelector("#fps")) {
			let fpsDisp = document.createElement("div");
			fpsDisp.id = "fps";
			document.body.appendChild(fpsDisp);
		}

		document.querySelector("#fps").innerHTML = `${Math.round(
			this.devStats.fps
		)}FPS`;
	}

	// Resize the canvas when the screen does to maintain proper resolution.
	resize() {
		this.canvas.width =
			(this.canvas.clientWidth * window.devicePixelRatio) /
			this.resolution;
		this.canvas.height =
			(this.canvas.clientHeight * window.devicePixelRatio) /
			this.resolution;
	}

	// Clear the canvas.
	clear() {
		this.ctx.beginPath();

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.ctx.closePath();
	}

	test() {
		this.ctx.beginPath();

		this.ctx.fillStyle = "red";
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.ctx.strokeStyle = "green";
		this.ctx.moveTo(0, 0);
		this.ctx.lineTo(this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.moveTo(this.ctx.canvas.width, 0);
		this.ctx.lineTo(0, this.ctx.canvas.height);
		this.ctx.stroke();

		this.ctx.closePath();
	}

	renderLevel2d(world) {
		let level = world.level;
		let wallSize = world.wallSize;

		for (let y in level) {
			for (let x in level[y]) {
				// If there is a wall here.
				if (level[y][x] != 0) {
					// Draw the wall.
					this.ctx.beginPath();

					this.ctx.fillStyle = "green";
					this.ctx.fillRect(
						x * wallSize,
						y * wallSize,
						wallSize,
						wallSize
					);

					this.ctx.closePath();
				}
			}
		}
	}
}
