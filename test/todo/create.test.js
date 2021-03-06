const { getTodos } = require("../../lib/get-todos");
const { writeFileSync } = require("fs");
const { join } = require("path");
const { build } = require("../../app");
const should = require("should");
require("tap").mochaGlobals();

describe("For the route for creation of todo POST: (/todo)", () => {
	let app;
	const ids = [];
	const filename = join(__dirname, "../../database.json");
	const encoding = "utf8";

	before(async () => {
		app = await build();
	});

	after(async () => {
		//clean database
		const todos = getTodos(filename, encoding);
		for (const id of ids) {
			const index = todos.findIndex((todo) => todo.id === id);
			//delete id
			if (index >= 0) {
				todos.splice(index, 1);
			}
			writeFileSync(filename, JSON.stringify({ todos }, null, 2), encoding);
		}
	});
	//happy path
	it("It should return { success:true, data: (new todo object) } and statusCode of 200 when called using POST", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/todo",
			payload: {
				text: "this is a todo",
				done: false,
			},
		});
		/**
		 * Informational responses (100–199)
		 * Successful responses (200–299)
		 * Redirects (300–399)
		 * Client errors (400–499)
		 * Server errors (500–599)
		 */
		const payload = response.json();
		const { statusCode } = response;
		const { success, data } = payload;
		const { text, done, id } = data;
		success.should.equal(true);
		statusCode.should.equal(200);
		text.should.equal("this is a todo");
		done.should.equal(false);

		const todos = getTodos(filename, encoding);
		const index = todos.findIndex((todo) => todo.id === id);
		index.should.not.equal(-1);
		const { text: textDatabase, done: doneDatabase } = todos[index];
		text.should.equal(textDatabase);
		done.should.equal(doneDatabase);

		// add id in array
		ids.push(id);
	});
	//happy path
	it("It should return { success:true, data: (new todo object) } and statusCode of 200 when called using POST even when we dont provide done property. Default is still false.", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/todo",
			payload: {
				text: "this is a todo 2",
			},
		});
		const payload = response.json();
		const { statusCode } = response;
		const { success, data } = payload;
		const { text, done, id } = data;
		success.should.equal(true);
		statusCode.should.equal(200);
		text.should.equal("this is a todo 2");
		done.should.equal(false);

		const todos = getTodos(filename, encoding);
		const index = todos.findIndex((todo) => todo.id === id);
		index.should.not.equal(-1);
		const { text: textDatabase, done: doneDatabase } = todos[index];
		text.should.equal(textDatabase);
		done.should.equal(doneDatabase);

		// add id in array
		ids.push(id);
	});
	//non-happy path
	it("It should return { success:true, message: error message } and statusCode of 400 when called using POST and there is no text", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/todo",
			payload: {
				done: true,
			},
		});
		const payload = response.json();
		const { statusCode } = response;
		const { success, message } = payload;
		statusCode.should.equal(400);
		success.should.equal(false);
		should.exist(message);
	});
	//non-happy path
	it("It should return { success:true, message: error message } and statusCode of 400 when called using POST and there is no payload", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/todo",
		});
		const payload = response.json();
		const { statusCode } = response;
		const { success, message } = payload;
		statusCode.should.equal(400);
		success.should.equal(false);
		should.exist(message);
	});
});

/**
 * ENRIQUEZ, CHAD ANDREI A.
 */
