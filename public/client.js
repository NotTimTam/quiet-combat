// Globally stored clients.
let storedClients = [];
let storedProjectiles = [];
let ping = {
	lastSubmit: 0,
	time: 0,
};

socket // SOCKET
	.on("connect", () => {
		console.log(`joined with id ${socket.id}`); // ojIckSD2jqNzOqIrAGzL
	})

	// Getting clientdata from the server.
	.on("data", (clients, projectiles) => {
		ping.time = Date.now() - ping.lastSubmit;
		storedClients = clients;
		storedProjectiles = projectiles;
		// console.log(storedClients);
	})

	// Recieving damage.
	.on("damage", (damage) => {
		player.health -= damage;
	})

	// Getting game data from the server.
	.on("initialized", (data) => {
		initializeGame(data);
	});

const getData = async () => {
	ping.lastSubmit = Date.now();
	socket.emit("data", {
		x: player.x,
		y: player.y,
		angle: player.angle,
		fov: player.light.range,
	});
};
const fireProjectile = () => {
	socket.emit("projectile", {
		x: player.x + player.width / 2,
		y: player.y + player.height / 2,
		angle: player.angle,
	});
};
