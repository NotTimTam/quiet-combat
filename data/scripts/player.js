"use strict";

class Player {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;

		this.keys = [];

		window.onkeydown = (e) => {
			this.keys[e.key] = true;
		};

		window.onkeyup = (e) => {
			this.keys[e.key] = false;
		};
	}

	input() {
		if (this.keys.ArrowUp) {
			this.y--;
		}

		if (this.keys.ArrowDown) {
			this.y++;
		}

		if (this.keys.ArrowLeft) {
			this.x--;
		}

		if (this.keys.ArrowRight) {
			this.x++;
		}
	}

	logic() {}

	render(ctx) {
		ctx.beginPath();

		ctx.fillStyle = "red";

		ctx.fillRect(this.x, this.y, 16, 16);

		ctx.closePath();
	}
}
