const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;

const app = express();
app.use(bodyParser.json());

const fileName = "todos.json";

const initialTodos = [];

const store = {
  async read() {
    try {
      await fs.access(fileName);
      this.todos = JSON.parse((await fs.readFile(fileName)).toString());
    } catch (e) {
      this.todos = initialTodos;
    }

    return this.todos;
  },

  async save() {
    try {
      await fs.writeFile(fileName, JSON.stringify(this.todos));
    } catch (e) {
      console.log(e);
    }
  },

  async getIndexById(id) {
    try {
      const todos = await this.read();
      return todos.findIndex(todo => todo.id === +id);
    } catch (e) {
      console.log(e);
    }
  },

  async getNextToDoId() {
    let maxId = 0;
    const todos = await this.read();
    todos.forEach(todo => {
      if (todo.id > maxId) maxId = todo.id;
    });
    return maxId + 1;
  },

  todos: []
};

app.get("/todos", async (req, res) => {
  res.json(await store.read());
});

app.get("/todos/:id", async (req, res) => {
  const todos = await store.read();
  const todo = todos.find(todo => todo.id === +req.params.id);
  res.json(todo);
});

app.post("/todos", async (req, res) => {
  const todo = req.body;
  todo.id = await store.getNextToDoId();
  store.todos.push(todo);
  await store.save();
  res.json(await store.read());
});

app.put("/todos/:id", async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  const todo = store.todos[index];
  const { name, completed } = req.body;
  if (name !== undefined) todo.name = name;
  if (completed !== undefined) todo.completed = completed;
  await store.save();
  res.json(todo);
});

app.delete("/todos/:id", async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  if (index !== -1) store.todos.splice(index, 1);
  await store.save();
  res.json(await store.read());
});

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
