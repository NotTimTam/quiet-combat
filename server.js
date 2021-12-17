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

const rooms = [];

const getClients = async (id, roomName) => {
	let clients = await io.in(roomName).fetchSockets();

	if (id) {
		clients = clients.filter((client) => client.id != id);
	}

	clients = clients.map((client) => {
		const { positionalData, id } = client;

		return { ...positionalData, id };
	});

	return clients;
};
class Projectile {
	constructor(x, y, angle, client = {}, room) {
		this.x = x;
		this.y = y;
		this.width = 2;
		this.height = 2;
		this.angle = angle;
		this.velocity = 10;

		this.damage = 10;

		this.color = "red";

		this.origin = client;
		this.room = room;
		if (!this.origin.id) this.origin.id = null;
	}

	delete() {
		this.room.projectiles.splice(this.room.projectiles.indexOf(this), 1);
	}

	async move() {
		let newPos = math.cartesian2(this.angle, this.velocity);
		this.x += newPos.x;
		this.y += newPos.y;

		// Check collisions.
		let clients = await getClients(this.origin.id, this.room.name);
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
			x: Math.round(this.x / this.room.world.wallSize - 0.5),
			y: Math.round(this.y / this.room.world.wallSize - 0.5),
		};
		let wall = this.room.world.getWall(wallPos.x, wallPos.y);

		// Do a collision check.
		if (wallPos) {
			if (math.AABB(this, wall)) {
				this.delete();
			}
		}
	}
}

setInterval(() => {
	for (let room of rooms) {
		for (let projectile of room.projectiles) {
			projectile.move();
		}

		while (room.projectiles.length > 999) {
			room.projectiles.shift();
		}
	}
}, updateRate);

app.use(express.static("./public"));

io.on("connection", (socket) => {
	console.log(`[${time()}] ${socket.id} connected`);

	// When the socket asks for data.
	socket.on("data", async (positionalData) => {
		let room = rooms.find((room) => room.name == socket.assignedRoom);

		// If the client is spamming request to the server.
		if (Date.now() - socket.lastRequest < 16) {
			return;
		}

		let clients = await getClients(socket.id, room.name);

		socket.positionalData = positionalData;
		socket.lastRequest = Date.now();

		io.to(socket.id).emit(
			"data",
			clients,
			room.projectiles.map((projectile) => {
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
		let room = rooms.find((room) => room.name == socket.assignedRoom);
		room.projectiles.push(
			new Projectile(
				positionalData.x,
				positionalData.y,
				positionalData.angle,
				socket,
				room
			)
		);
	});

	// When a socket leaves.
	socket.on("disconnect", () => {
		// Close connection and remove socket from room.
		try {
			let room = rooms.find((room) => room.name == socket.assignedRoom);
			room.clients.splice(room.clients.indexOf(socket), 1);

			// Delete the room if it has no players.
			if (room.clients.length == 0) {
				rooms.splice(rooms.indexOf(room));
			}
			console.log(`[${time()}] ${socket.id} disconnected`);
		} catch {
			console.log(`[${time()}] ${socket.id} is loading into room`);
		}

		socket.conn.close();
	});

	// When a socket creates a new room.
	socket.on("createRoom", (socketId, room) => {
		if (!room.name || rooms.find((roomser) => roomser.name == room.name)) {
			room.name = `ROOM-${rooms.length + 1}`;
		}
		room.clients = [];
		room.projectiles = [];

		const gameData = { level: levels["rust"] };
		const world = new World(gameData);

		room.world = world;

		rooms.push(room);
		console.log(`[${time()}] ${socketId} created room "${room.name}"`);
		io.to(socketId).emit("roomCreated", room);
	});

	// When a socket joins a new room.
	socket.on("joinRoom", (roomName) => {
		try {
			const room = rooms.find((room) => room.name == roomName);
			if (room.clients.length < room.maxClients) {
				socket.join(room.name);
				socket.assignedRoom = room.name;
				room.clients.push(socket);
				io.to(socket.id).emit("initialized", room.world.gameData);
			} else {
				io.to(socket.id).emit("failedToJoinRoom");
			}
		} catch {
			io.to(socket.id).emit("failedToJoinRoom");
		}
	});

	// When a socket asks for all the rooms.
	socket.on("getRooms", () => {
		io.to(socket.id).emit(
			"roomList",
			rooms.map((room) => {
				const { name, clients, maxClients } = room;

				return { name, clients: clients.length, maxClients };
			})
		);
	});
});

server.listen(port, '0.0.0.0');

//  () => {
	// console.log(`[${time()}] listening on port ${port}`);
// }
