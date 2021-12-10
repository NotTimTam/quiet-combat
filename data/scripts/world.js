"use strict";

class Wall {
	constructor(wallType) {
		this.wallType = wallType;
	}
}

class World {
	constructor(level) {
		this.levelData = level;
		this.level = [];
		this.wallSize = 16;

		this.generateLevel();
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

					this.level[y][x] = new Wall(this.levelData[y][x]);
				}
			}
		}

		console.log(this.level);
	}
}
