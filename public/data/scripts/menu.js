"use strict";

let storedRoomList;

socket // SOCKET
	.on("connect", () => {
		console.log(`joined with id ${socket.id}`); // ojIckSD2jqNzOqIrAGzL
	})
	.on("roomCreated", (room) => {
		window.location.href = `/game.html#${room.name}`;
	})
	.on("roomList", (roomList) => {
		let roomDisp = document.querySelector(".rooms");
		roomDisp.innerHTML = "";

		storedRoomList = roomList;

		if (roomList.length == 0) {
			roomDisp.innerHTML = `<button class="room full">
				<h5>No rooms available.<h5>
			</button>`;
		} else {
			for (let room of roomList) {
				roomDisp.innerHTML += `
					<button class="room ${
						room.clients >= room.maxClients && "full"
					}" onclick="joinRoom('${room.name}')">
						<h5>${room.name}</h5>
						<h5>${room.clients}/${room.maxClients}</h5>
					</button>
				`;
			}
		}
	});

const loadRooms = () => {
	document.querySelector(".joinMenu").classList.remove("hidden");

	socket.emit("getRooms");
};

const joinRoom = (roomName) => {
	let room = storedRoomList.find((room) => room.name == roomName);
	if (room.clients < room.maxClients) {
		window.location.href = `/game.html#${room.name}`;
	}
};

const play = () => {
	let name = document.querySelector("#roomName").value;
	if (!name) {
		name = null;
	}
	if (name.length > 32) {
		name = name.slice(0, 32);
	}
	name = name.toLowerCase();
	name = name.replace(/\s/g, "_");

	let maxClients = document.querySelector("#playerCount").value;
	if (!maxClients || maxClients == 0 || maxClients == 1 || maxClients > 10) {
		maxClients = 10;
	}

	socket.emit("createRoom", socket.id, {
		name,
		maxClients,
	});
};
