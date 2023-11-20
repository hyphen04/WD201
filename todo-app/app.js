const express = require("express");
const app = express();
const path = require("path");
const { Todo } = require("./models");

const bodyParser = require("body-parser");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")))

app.set("view engine", "ejs")


app.get("/", async (request, response) =>  {
  const allTodos = await Todo.findAll();
  const today = new Date();
  const formattedDate = formatDate(today);

  if(request.accepts("html")) {
    response.render("index", { allTodos, formattedDate });
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
    console.log();
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
  });
    return response.redirect("/");
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
