const express = require("express");
const app = express();

const todos = require("./todos.json");

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.listen(8000);
