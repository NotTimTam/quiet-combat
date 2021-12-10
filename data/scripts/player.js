"use strict";

class Player {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
		this.width = 8;
		this.height = 8;

		this.physics = {
			lastX: 0,
			lastY: 0,
			velocity: 0,
			speed: 1,
		};

		this.keys = [];

		window.onkeydown = (e) => {
			this.keys[e.key] = true;
		};

		window.onkeyup = (e) => {
			this.keys[e.key] = false;
		};
	}

	// Check for a collision in a direction.
	checkCol(dir) {
		// The hypothetical bounding box is where the player would be if the move occured.
		let hbb = {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};

		switch (dir) {
			case 0:
				hbb.y -= this.physics.speed;
				break;
			case 1:
				hbb.x += this.physics.speed;
				break;
			case 2:
				hbb.y += this.physics.speed;
				break;
			case 3:
				hbb.x -= this.physics.speed;
				break;
			default:
				break;
		}

		for (let y in world.level) {
			for (let x in world.level[y]) {
				let wall = world.level[y][x]; // Get the wall.

				if (!wall) continue; // If there isn't a wall here we move on.

				// Check if the wall is close enough to check, otherwise move on.
				if (
					math.distance(wall, hbb) <=
					wallSize + (player.width + player.height) / 2
				) {
					console.log(wall);

					if (math.AABB(hbb, wall)) {
						
						return true; // HIT!
					}
				} else {
					continue;
				}
			}
		}

		return false; // NO HIT!
	}

	input() {
		// Check for collisions in the direction of travel and then apply the travel if there are none.
		if (this.keys.ArrowUp || this.keys.w) {
			if (!this.checkCol(0)) {
				this.y -= this.physics.speed;
			}
		}
		if (this.keys.ArrowRight || this.keys.d) {
			if (!this.checkCol(1)) {
				this.x += this.physics.speed;
			}
		}
		if (this.keys.ArrowDown || this.keys.s) {
			if (!this.checkCol(2)) {
				this.y += this.physics.speed;
			}
		}
		if (this.keys.ArrowLeft || this.keys.a) {
			if (!this.checkCol(3)) {
				this.x -= this.physics.speed;
			}
		}
	}

	logic() {}
}
