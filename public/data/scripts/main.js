"use strict";

// Major global variable initilization.
let draw;
let world;
let player;

// The game can only be initialized after game data is recieved from the server.
const initializeGame = (gameData) => {
	// Create renderer.
	draw = new Renderer();
	world = new World(gameData.level);

	let playerSpawn = world.getSpawn();
	player = new Player(playerSpawn.x, playerSpawn.y);

	// Get client data from the server.
	let refresh = 1;
	window.setInterval(() => {
		getData();
	}, refresh);

	// Start the game loop.
	requestAnimationFrame(loop);
};

// Game Loop.
function loop() {
	// INPUT
	player.input();

	// LOGIC
	player.logic();

	// RENDER
	draw.clear();
	draw.renderLevel2d();

	// Display Dev Renders
	if (settings.dev_mode) {
		draw.fps();
	}

	requestAnimationFrame(loop);
}
