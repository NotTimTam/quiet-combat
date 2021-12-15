require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000;
let start = Date.now();
const time = () => {
	oldStart = start;
	start = Date.now();
	return `${Date.now() - oldStart}ms`;
};

const gameData = { level: "rust" };

const getClients = async (id) => {
	let clients = await io.fetchSockets();
	clients = clients
		.filter((client) => client.id != id)
		.map((client) => {
			const { positionalData } = client;

			return positionalData;
		});

	return clients;
};

app.use(express.static("./public"));

io.on("connection", (socket) => {
	console.log(`[${time()}] ${socket.id} connected`);

	io.to(socket.id).emit("initialized", gameData);

	// When the socket asks for data.
	socket.on("clients", async (positionalData) => {
		// If the client is spamming request to the server.
		if (Date.now() - socket.lastRequest < 16) {
			return;
		}

		let clients = await getClients(socket.id);

		socket.positionalData = positionalData;
		socket.lastRequest = Date.now();

		io.to(socket.id).emit("clients", clients);
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
