"use strict";

const wallSize = 16;

class Wall {
	constructor(x, y, wallType) {
		this.x = x * wallSize;
		this.y = y * wallSize;
		this.width = wallSize;
		this.height = wallSize;

		this.wallType = wallType;
	}
}

class World {
	constructor(gameData) {
		this.gameData = gameData;
		this.levelData = gameData.level;
		this.level = [];
		this.wallSize = wallSize;

		this.generateLevel();
	}

	// Check if a wall is on screen.
	isOnScreen(wall, camera) {
		if (wall.x + wall.width < camera.x) {
			return false;
		}

		if (wall.y + wall.height < camera.y) {
			return false;
		}

		if (wall.x > camera.x + draw.canvas.width) {
			return false;
		}

		if (wall.y > camera.y + draw.canvas.height) {
			return false;
		}

		return true;
	}

	// Get a random spawn position.
	getSpawn() {
		let spawns = [];

		for (let y in this.levelData) {
			for (let x in this.levelData[y]) {
				// If there is NOT a wall here.
				if (this.levelData[y][x] == 9) {
					spawns.push({
						x: x * this.wallSize + math.randInt(0, 8),
						y: y * this.wallSize + math.randInt(0, 8),
					});
				}
			}
		}

		return spawns[Math.floor(Math.random() * spawns.length)];
	}

	// Get the wall at a position.
	getWall(x, y) {
		if (!this.level[y] || !this.level[y][x]) return false;

		return this.level[y][x];
	}

	// Loop through leveldata and create world.
	generateLevel() {
		for (let y in this.levelData) {
			for (let x in this.levelData[y]) {
				// If there is a wall here.
				if (this.levelData[y][x] != 0 && this.levelData[y][x] != 9) {
					// Check if the row doesn't exist in the data.
					if (!this.level[y]) {
						this.level[y] = [];
					}

					this.level[y][x] = new Wall(x, y, this.levelData[y][x]);
				}
			}
		}
	}
}

module.exports = { World, Wall };
