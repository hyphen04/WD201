const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.send("Hello World");
});

app.get("/todos", async function (_request, response) {
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.create(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: "Unprocessable Entity" });
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const updatedTodo = await todo.update({ completed: true });
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: "Unprocessable Entity" });
  }
});

app.delete("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    await todo.destroy();
    return response.status(200).json({ success: "Todo deleted" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
