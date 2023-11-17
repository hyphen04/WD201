const express = require("express");
const app = express();
const path = require("path");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")))

app.set("view engine", "ejs")

app.get("/", async (request, response) =>  {
  const allTodos = await Todo.findAll();
  if(request.accepts("html")) {
    response.render("index", {allTodos});
  }else {
    response.json(allTodos);
  }
  
})

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

const { Todo } = require("./models");

app.delete("/todos/:id", async function (request, response) {
  const todoId = request.params.id;

  try {
    const todo = await Todo.findByPk(todoId);

    if (todo) {
      await todo.destroy();
      response.send(true); 
    } else {
      response.send(false); 
    }
  } catch (error) {
    console.error("Error deleting Todo:", error);
    response.send(false); 
  }
});


module.exports = app;
