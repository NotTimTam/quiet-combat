// Globally stored clients.
let storedClients = [];
let ping = {
	lastSubmit: 0,
	time: 0,
};

socket // SOCKET
	.on("connect", () => {
		console.log(`joined with id ${socket.id}`); // ojIckSD2jqNzOqIrAGzL
	})

	// Getting clientdata from the server.
	.on("clients", (clients) => {
		ping.time = Date.now() - ping.lastSubmit;
		storedClients = clients;
		// console.log(storedClients);
	})

	// Getting game data from the server.
	.on("initialized", (data) => {
		initializeGame(data);
	});

const getClients = async () => {
	ping.lastSubmit = Date.now();
	socket.emit("clients", {
		x: player.x,
		y: player.y,
		angle: player.angle,
		fov: player.light.range,
	});
};
