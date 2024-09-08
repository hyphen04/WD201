
/* eslint-disable no-undef */
const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");
const { ensureLoggedIn } = require("connect-ensure-login");

let server, agent;

// Function to extract CSRF token from HTML response
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

// Function to log in a user using the provided agent
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo Application", function () {
  // Setup before all tests
  beforeAll(async () => {
    // Sync the database and start the server
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  // Cleanup after all tests
  afterAll(async () => {
    try {
      // Close the database connection and stop the server
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  // Test case: Sign up
  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  // Test case: Sign out
  test("Sign out", async () => {
    let res = await agent.get("/todos");
    console.log("First request to /todos:", res.statusCode);

    res = await agent.get("/signout");
    console.log("Signout request:", res.statusCode, res.text);

    expect(res.statusCode).toBe(302); // Ensure to check the console for additional information
  });

  // Test case: Creates a todo and responds with JSON at /todos POST endpoint
  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  // Test case: Marks a todo with given ID as complete
  test("Marks a todo with given ID as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    // eslint-disable-next-line no-unused-vars
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const countDueToday = parsedGroupedResponse.DueToday.length;
    const latestTodo = parsedGroupedResponse.DueToday[countDueToday - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: false,
    });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Marks a todo with given ID as incomplete",async()=>{
    const agent=request.agent(server);
    await login(agent,"user.a@test.com","12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
    .get("/todos")
    .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const countDueToday = parsedGroupedResponse.DueToday.length;
    const latestTodo = parsedGroupedResponse.DueToday[countDueToday - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    
    const markInCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed:false,
    });
    const parsedUpdateResponse = JSON.parse(markInCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);

    const groupedTodosResponse1 = await agent
    .get("/todos")
    .set("Accept", "application/json");
    const parsedGroupedResponse1 = JSON.parse(groupedTodosResponse1.text);
    const countDueToday1 = parsedGroupedResponse1.DueToday.length;
    const latestTodo1 = parsedGroupedResponse1.DueToday[countDueToday1 - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent.put(`/todos/${latestTodo1.id}`).send({
      _csrf: csrfToken,
      completed:true,
    });
    const parsedUpdateResponse1 = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse1.completed).toBe(false);
  });

 

  test("Delete a todo with given id,when it exists and sends boolean response", async () => {
   
    const agent=request.agent(server);
    await login(agent,"user.a@test.com","12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Delete me",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });


    const groupedTodosResponse = await agent
    .get("/todos")
    .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const countDueToday = parsedGroupedResponse.DueToday.length;
    const latestTodo = parsedGroupedResponse.DueToday[countDueToday - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    const parsedUpdateResponse = JSON.parse(deleteResponse.text);
    expect(parsedUpdateResponse.success).toBe(true);
  });

});
