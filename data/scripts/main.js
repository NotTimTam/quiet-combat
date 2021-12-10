"use strict";

// Create renderer.
let draw = new Renderer();
let world = new World(devLevel);
let player = new Player(16, 16);

// Game Loop.
function loop() {
	// INPUT
	player.input();

	// LOGIC

	// RENDER
	draw.clear();
	draw.renderLevel2d(world);
	player.render(draw.ctx);

	// Display Dev Renders
	if (settings.dev_mode) {
		draw.fps();
	}

	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
