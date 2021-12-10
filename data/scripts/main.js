"use strict";

// Create renderer.
let draw = new Renderer();
let player = new Player();

// Game Loop.
function loop() {
	// INPUT
	player.input();

	// LOGIC

	// RENDER
	draw.clear();
	player.render(draw.ctx);

	// Display Dev Renders
	if (settings.dev_mode) {
		draw.fps();
	}

	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
