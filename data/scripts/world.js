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
	constructor(level) {
		this.levelData = level;
		this.level = [];
		this.wallSize = wallSize;

		this.generateLevel();
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
				if (this.levelData[y][x] != 0) {
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
