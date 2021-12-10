class MathFunctions {
	constructor() {
		console.log("MATH FUNCTIONS LOADED");
	}

	AABB = (rect1, rect2) => {
		if (
			rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.y + rect1.height > rect2.y
		) {
			return true;
		} else {
			return false;
		}
	};

	isOnScreen = (object, camera) => {
		// console.log(object);

		if (object.x + object.size < camera.x) {
			return false;
		} else if (object.x - object.size > camera.x + canvas.width) {
			return false;
		}

		if (object.y + object.size < camera.y) {
			return false;
		} else if (object.y - object.size > camera.y + canvas.height) {
			return false;
		}

		return true;
	};

	angle = (object1, object2) => {
		return this.deg(
			Math.atan2(object1.y - object2.y, object1.x - object2.x)
		);
	};

	distance = (object1, object2) => {
		return Math.sqrt(
			(object2.x - object1.x) ** 2 + (object2.y - object1.y) ** 2
		);
	};

	deg = (radian) => {
		return radian * (180 / Math.PI);
	};
	rad = (degree) => {
		return degree * (Math.PI / 180);
	};

	randInt = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	vector2 = (x, y) => {
		return {
			dirRadian: Math.atan2(y, x),
			dirDegree: this.deg(Math.atan2(y, x)),
			velocity: Math.sqrt(x ** 2 + y ** 2),
		};
	};

	cartesian2 = (angle, velocity) => {
		return {
			x: velocity * Math.cos(this.rad(angle)),
			y: velocity * Math.sin(this.rad(angle)),
		};
	};
}

const math = new MathFunctions();
