const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(404).json({ error: "Mensagem de erro" });
  }

  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checkUserNameExists = users.find(user => user.username === username);

  if (checkUserNameExists) {
    return response.status(400).json({ error: "Mensagem de erro"});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);
  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoUpdate = user.todos.find((todo) => todo.id === id);

  if (!todoUpdate) {
    response.status(404).json({ error: "Mensagem de erro" });
  }

  todoUpdate.title = title;
  todoUpdate.deadline = deadline;

  response.status(200).json(todoUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoUpdateStatus = user.todos.find(todo => todo.id === id);

  if(!todoUpdateStatus) {
    response.status(404).json({ error: "Mensagem de erro" });
  }

  todoUpdateStatus.done = !todoUpdateStatus.done;
  response.status(200).json(todoUpdateStatus);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoDelete = user.todos.find(todo => todo.id === id);

  if (!todoDelete) {
    response.status(404).json({ error: "Mesangem de erro" });
  }

  user.todos.splice(user.todos.indexOf(todoDelete), 1);
  response.status(204).json(user.todos);
});

module.exports = app;