require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const math = require("./data/math");
const levels = require("./data/levels");
const { World } = require("./data/world");

const port = process.env.PORT || 3000;
let start = Date.now();
const time = () => {
	oldStart = start;
	start = Date.now();
	return `${Date.now() - oldStart}ms`;
};

let updateRate = 1000 / 60;

const gameData = { level: levels["rust"] };
const world = new World(gameData.level);

const getClients = async (id) => {
	let clients = await io.fetchSockets();

	if (id) {
		clients = clients.filter((client) => client.id != id);
	}

	clients = clients.map((client) => {
		const { positionalData, id } = client;

		return { ...positionalData, id };
	});

	return clients;
};
const projectiles = [];
class Projectile {
	constructor(x, y, angle, client = {}) {
		this.x = x;
		this.y = y;
		this.width = 2;
		this.height = 2;
		this.angle = angle;
		this.velocity = 5;

		this.damage = 5;

		this.color = "red";

		this.origin = client;
		if (!this.origin.id) this.origin.id = null;

		projectiles.push(this);
	}

	delete() {
		projectiles.splice(projectiles.indexOf(this), 1);
	}

	async move() {
		let newPos = math.cartesian2(this.angle, this.velocity);
		this.x += newPos.x;
		this.y += newPos.y;

		// Check collisions.
		let clients = await getClients(this.origin.id);
		for (let client of clients) {
			if (
				client &&
				math.AABB(this, {
					x: client.x,
					y: client.y,
					width: 8,
					height: 8,
				})
			) {
				this.delete();

				// Send damage to client.
				io.to(client.id).emit("damage", this.damage);
			}
		}

		let wallPos = {
			x: Math.round(this.x / world.wallSize - 0.5),
			y: Math.round(this.y / world.wallSize - 0.5),
		};
		let wall = world.getWall(wallPos.x, wallPos.y);

		// Do a collision check.
		if (wallPos) {
			if (math.AABB(this, wall)) {
				this.delete();
			}
		}
	}
}

setInterval(() => {
	for (let projectile of projectiles) {
		projectile.move();
	}

	while (projectiles.length > 999) {
		projectiles.shift();
	}
}, updateRate);

app.use(express.static("./public"));

io.on("connection", (socket) => {
	console.log(`[${time()}] ${socket.id} connected`);

	io.to(socket.id).emit("initialized", gameData);

	// When the socket asks for data.
	socket.on("data", async (positionalData) => {
		// If the client is spamming request to the server.
		if (Date.now() - socket.lastRequest < 16) {
			return;
		}

		let clients = await getClients(socket.id);

		socket.positionalData = positionalData;
		socket.lastRequest = Date.now();

		io.to(socket.id).emit(
			"data",
			clients,
			projectiles.map((projectile) => {
				const { x, y, width, height, color } = projectile;

				return {
					x,
					y,
					width,
					height,
					color,
				};
			})
		);
	});

	// When the socket creates a projectile.
	socket.on("projectile", (positionalData) => {
		new Projectile(
			positionalData.x,
			positionalData.y,
			positionalData.angle,
			socket
		);
	});

	// When a socket leaves.
	socket.on("disconnect", () => {
		console.log(`[${time()}] ${socket.id} disconnected`);

		socket.conn.close();
	});
});

server.listen(port, () => {
	console.log(`[${time()}] listening on port ${port}`);
});
