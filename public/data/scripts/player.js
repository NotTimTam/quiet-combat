"use strict";

class Player {
	constructor(x = 0, y = 0) {
		// Hitbox/positional data.
		this.x = x;
		this.y = y;
		this.width = 8;
		this.height = 8;
		this.angle = 0;
		this.health = 100;

		this.scoreboard = {
			deaths: 0,
			kills: 0,
		};

		// Lighting system.
		this.light = {
			strength: 30,
			range: 45,
		};

		// Physics data.
		this.physics = {
			lastX: 0,
			lastY: 0,

			xVel: 0,
			yVel: 0,
			topSpeed: 2,
			accel: 1,
			decel: 0.5,
		};

		// The camera rotation and logic.
		this.camera = {
			x: x,
			y: y,
			desX: x - draw.canvas.width / 2,
			desY: y - draw.canvas.height / 2,
			smooth: 6,
			smoothMove: () => {
				this.camera.desX = Math.round(
					this.x +
						this.width / 2 -
						draw.canvas.width / 2 +
						(this.mouse.x - draw.canvas.width / 2) / 2
				);
				this.camera.desY = Math.round(
					this.y +
						this.height / 2 -
						draw.canvas.height / 2 +
						(this.mouse.y - draw.canvas.height / 2) / 2
				);

				let newCamPos = math.cartesian2(
					math.angle(
						{ x: this.camera.desX, y: this.camera.desY },
						this.camera
					),
					math.distance(
						{ x: this.camera.desX, y: this.camera.desY },
						this.camera
					) / this.camera.smooth
				);

				this.camera.x += newCamPos.x;
				this.camera.y += newCamPos.y;

				this.camera.x = Math.round(this.camera.x);
				this.camera.y = Math.round(this.camera.y);
			},
		};

		// Inputs.
		this.keys = [];
		this.mouse = {
			x: 0,
			y: 0,
		};
		window.addEventListener("mousemove", (e) => {
			this.mouse.x = (e.clientX / window.innerWidth) * draw.canvas.width;
			this.mouse.y =
				(e.clientY / window.innerHeight) * draw.canvas.height;
		});

		window.onkeydown = (e) => {
			this.keys[e.key] = true;
		};

		window.onkeyup = (e) => {
			this.keys[e.key] = false;
		};

		window.onmousedown = (e) => {
			fireProjectile();
		};
	}

	// Ensure that velocities don't go outside of max.
	checkVels() {
		// X Velocities check against topSpeed.
		if (this.physics.xVel < -this.physics.topSpeed) {
			this.physics.xVel = -this.physics.topSpeed;
		}
		if (this.physics.xVel > this.physics.topSpeed) {
			this.physics.xVel = this.physics.topSpeed;
		}
		if (this.physics.yVel < -this.physics.topSpeed) {
			this.physics.yVel = -this.physics.topSpeed;
		}
		if (this.physics.yVel > this.physics.topSpeed) {
			this.physics.yVel = this.physics.topSpeed;
		}
	}

	// Slow down x velocity with decel.
	slowVels() {
		if (this.physics.xVel > 0) {
			this.physics.xVel -= this.physics.decel;
		}

		if (this.physics.xVel < 0) {
			this.physics.xVel += this.physics.decel;
		}

		if (this.physics.yVel > 0) {
			this.physics.yVel -= this.physics.decel;
		}

		if (this.physics.yVel < 0) {
			this.physics.yVel += this.physics.decel;
		}
	}

	// Check for a collision in a direction.
	checkCol(dir, amt = 1) {
		// The hypothetical bounding box is where the player would be if the move occured.
		let hbb = {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};

		switch (dir) {
			case 0:
				hbb.y -= amt;
				break;
			case 1:
				hbb.x += amt;
				break;
			case 2:
				hbb.y += amt;
				break;
			case 3:
				hbb.x -= amt;
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
					if (math.AABB(hbb, wall)) {
						return { hit: true, wall }; // HIT!
					}
				} else {
					continue;
				}
			}
		}

		return { hit: false }; // NO HIT!
	}

	checkColsInDirs() {
		if (this.physics.xVel > 0 && this.checkCol(1, this.physics.xVel).hit) {
			this.physics.xVel = 0;

			// this.x = Math.ceil(this.x);
		}

		if (this.physics.xVel < 0 && this.checkCol(3, -this.physics.xVel).hit) {
			this.physics.xVel = 0;

			// this.x = Math.floor(this.x);
		}

		if (this.physics.yVel < 0 && this.checkCol(0, -this.physics.yVel).hit) {
			this.physics.yVel = 0;

			// this.y = Math.ceil(this.y);
		}

		if (this.physics.yVel > 0 && this.checkCol(2, this.physics.yVel).hit) {
			this.physics.yVel = 0;

			// this.y = Math.floor(this.y);
		}
	}

	respawn() {
		let newLoc = world.getSpawn();
		this.x = newLoc.x;
		this.y = newLoc.y;
	}

	kill() {
		this.scoreboard.deaths++;
		this.respawn();
		this.health = 100;
	}

	input() {
		// Check for collisions in the direction of travel and then apply the travel if there are none.
		if (this.keys.d || this.keys.ArrowRight) {
			this.physics.xVel += this.physics.accel;
		}

		if (this.keys.a || this.keys.ArrowLeft) {
			this.physics.xVel -= this.physics.accel;
		}

		if (this.keys.w || this.keys.ArrowUp) {
			this.physics.yVel -= this.physics.accel;
		}

		if (this.keys.s || this.keys.ArrowDown) {
			this.physics.yVel += this.physics.accel;
		}
	}

	logic() {
		// If we are dead, respawn.
		if (this.health <= 0) {
			this.kill();
		}

		// Move camera to target.
		this.camera.smoothMove();

		// Ensure velocity maxes are not passed.
		this.checkVels();

		// Check all velocities and cols.
		this.checkColsInDirs();

		// Slow down.
		this.slowVels();

		// Move.
		this.x += this.physics.xVel;
		this.y += this.physics.yVel;

		// Rotate.
		const worldMouse = {
			x: player.camera.x + player.mouse.x,
			y: player.camera.y + player.mouse.y,
		};
		const playerCenter = {
			x: player.x + player.width / 2,
			y: player.y + player.height / 2,
		};
		this.angle = math.angle(worldMouse, playerCenter);
	}
}
