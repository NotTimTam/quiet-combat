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

		// Wall colors.
		this.wallColors = ["white", "rgb(84,64,64)", "rgb(74,58,41)"];

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

	castRay(source, target, step = 1, ignore = null) {
		// Create a ray object.
		let ray = {
			x: source.x + 4,
			y: source.y + 4,
			width: 0.5,
			height: 0.5,
		};

		// Keep moving and checking the ray until we reach the target.
		while (math.distance(ray, target) > step) {
			// Calculate the new position of the ray using a vector. We move forward the number of steps that are predefined using step. The smaller the number the more likely the ray is to hit small objects instead of moving over them.
			let newPos = math.cartesian2(math.angle(target, ray), step);

			// Move the ray.
			ray.x += newPos.x;
			ray.y += newPos.y;

			// CHECK AGAINST PLAYERS.
			for (let client of storedClients) {
				if (
					client &&
					ignore != client &&
					math.distance(ray, client) < player.width + player.height &&
					math.AABB(ray, {
						x: client.x + 1,
						y: client.y + 1,
						width: player.width - 1,
						height: player.height - 1,
					})
				) {
					return {
						hit: true,
						type: "client",
						x: ray.x,
						y: ray.y,
						client,
					};
				}
			}

			// CHECK AGAINST WALLS.

			// Get the ray's tile position.
			let wallPos = {
				x: Math.round(ray.x / world.wallSize - 0.5),
				y: Math.round(ray.y / world.wallSize - 0.5),
			};
			let wall = world.getWall(wallPos.x, wallPos.y);

			// Do a collision check.
			if (wallPos) {
				if (
					math.AABB(ray, wall)
					// &&
					// math.distance(ray, {
					// 	x: wallPos.x + 4,
					// 	y: wallPos.y + 4,
					// }) <= 5
				) {
					return {
						hit: true,
						type: "wall",
						x: ray.x,
						y: ray.y,
						wall,
					}; // Return where the ray ended. Since this is a truthy value, it is still considered a return of "true," with the added benefit of knowing where the ray landed.
				} else if (
					!math.AABB(ray, wall) &&
					math.distance(ray, wall) <
						(wall.width + wall.height) / 2 + 1
				) {
					// The wall was close but didn' get hit. We return false but pass through the wall for rendering purposes.
					return {
						hit: false,
						type: "none",
						x: ray.x,
						y: ray.y,
						wall,
					};
				}
			}
		}

		return { hit: false, type: "none", x: ray.x, y: ray.y }; // If the ray doesn't collide with anything, than we return false, meaning the cast was "successful."
	}

	draw2DRay(x1, y1, x2, y2, color, lineWidth = 1) {
		this.ctx.beginPath();

		this.ctx.lineWidth = lineWidth;
		this.ctx.strokeStyle = color;

		this.ctx.moveTo(Math.round(x1), Math.round(y1));
		this.ctx.lineTo(Math.round(x2), Math.round(y2));
		this.ctx.stroke();

		this.ctx.closePath();
	}

	renderPlayerLight(detail = 0.5) {
		const playerCenter = {
			x: player.x + player.width / 2,
			y: player.y + player.height / 2,
		};

		for (
			let angle = player.angle - player.light.range;
			angle < player.angle + player.light.range;
			angle += detail
		) {
			const rayTarget = math.cartesian2(angle, 2500);
			const ray = this.castRay(playerCenter, rayTarget);

			this.draw2DRay(
				Math.round(playerCenter.x - player.camera.x),
				Math.round(playerCenter.y - player.camera.y),
				Math.round(ray.x - player.camera.x),
				Math.round(ray.y - player.camera.y),
				"rgba(255, 255, 255, 0.1)",
				3
			);

			if (ray.wall) {
				const opac =
					player.light.strength /
					math.distance(ray.wall, playerCenter);

				this.renderWall(
					ray.wall,

					opac
				);
			}

			if (ray.client) {
				this.renderClient(ray.client, "red");
			}
		}
	}

	renderClient(client, color = "blue") {
		if (!client) {
			return;
		}
		this.ctx.beginPath();

		this.ctx.fillStyle = color;

		this.ctx.fillRect(
			Math.round(client.x - player.camera.x),
			Math.round(client.y - player.camera.y),
			Math.round(player.width),
			Math.round(player.height)
		);

		this.ctx.closePath();

		if (client != player) {
			const clientCenter = {
				x: client.x + player.width / 2,
				y: client.y + player.height / 2,
			};

			let angle1Target = math.cartesian2(client.angle - client.fov, 25);
			let angle2Target = math.cartesian2(client.angle + client.fov, 25);

			angle1Target.x += clientCenter.x;
			angle1Target.y += clientCenter.y;

			angle2Target.x += clientCenter.x;
			angle2Target.y += clientCenter.y;

			let angle1 = this.castRay(clientCenter, angle1Target, 1, client);
			let angle2 = this.castRay(clientCenter, angle2Target, 1, client);

			this.draw2DRay(
				Math.round(clientCenter.x - player.camera.x),
				Math.round(clientCenter.y - player.camera.y),
				Math.round(angle1.x - player.camera.x),
				Math.round(angle1.y - player.camera.y),
				"rgba(255,100,0,0.15)",
				1
			);

			this.draw2DRay(
				Math.round(clientCenter.x - player.camera.x),
				Math.round(clientCenter.y - player.camera.y),
				Math.round(angle2.x - player.camera.x),
				Math.round(angle2.y - player.camera.y),
				"rgba(255,100,0,0.15)",
				1
			);
		}
	}

	renderWall(wall, opacity = 0.5) {
		if (wall && world.isOnScreen(wall, player.camera)) {
			// Draw the wall.
			this.ctx.save();
			this.ctx.beginPath();

			this.ctx.globalAlpha = opacity;

			this.ctx.fillStyle = this.wallColors[wall.wallType];
			if (
				settings.dev_mode &&
				math.distance(wall, player) <=
					wallSize + (player.width + player.height) / 2
			) {
				this.ctx.fillStyle = "yellow";
			}

			this.ctx.fillRect(
				wall.x - player.camera.x,
				wall.y - player.camera.y,
				wallSize,
				wallSize
			);

			this.ctx.closePath();
			this.ctx.restore();
		}
	}

	renderWorld(world) {
		let level = world.level;
		let wallSize = world.wallSize;

		for (let y in level) {
			for (let x in level[y]) {
				// If there is a wall here.
				if (
					level[y][x] != 0 &&
					world.isOnScreen(level[y][x], player.camera)
				) {
					// Draw the wall.
					this.ctx.beginPath();

					this.ctx.fillStyle = "green";
					if (
						math.distance(level[y][x], player) <=
						wallSize + (player.width + player.height) / 2
					) {
						this.ctx.fillStyle = "yellow";
					}

					this.ctx.fillRect(
						x * wallSize - player.camera.x,
						y * wallSize - player.camera.y,
						wallSize,
						wallSize
					);

					this.ctx.closePath();
				}
			}
		}
	}

	renderLevel2d() {
		// RENDER PLAYER
		this.renderPlayerLight();
		this.renderClient(player);

		for (let client of storedClients) {
			if (
				client &&
				client.seen &&
				math.isOnScreen(
					{
						x: client.x,
						y: client.y,
						width: player.width,
						height: player.height,
					},
					player.camera,
					draw.canvas
				)
			) {
				this.renderClient(client, "red");
			}
		}
	}
}
