const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Use DB_CONNECT environment variable only
let dbHost = process.env.DB_CONNECT || '';
console.log(`Using DB_CONNECT: ${dbHost}`);

// Extract hostname and port if included
const parseHost = (host) => {
  const withoutProtocol = host.replace(/^https?:\/\//, '');
  const [hostname, port] = withoutProtocol.split(':');
  return { hostname, port: port ? parseInt(port) : 5432 };
};

// Use in-memory or database
let db = null;
const inMemoryTodos = [];

if (dbHost) {
  const { hostname, port } = parseHost(dbHost);
  db = new Pool({
    host: hostname,
    port,
    user: 'postgres',
    password: 'postgres',
    database: 'todos',
  });

  (async () => {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS todo_items (
          id SERIAL PRIMARY KEY,
          task TEXT NOT NULL
        )
      `);
    } catch (err) {
      console.error('Failed to create table:', err);
      process.exit(1);
    }
  })();
}

app.use(bodyParser.json());

app.get('/todos', async (req, res) => {
  if (db) {
    try {
      const result = await db.query('SELECT * FROM todo_items');
      res.json(result.rows);
    } catch (err) {
      res.status(500).send('Database error');
    }
  } else {
    res.json(inMemoryTodos);
  }
});

app.post('/todos', async (req, res) => {
  const task = req.body.task;
  if (!task) return res.status(400).send('Task is required');

  if (db) {
    try {
      await db.query('INSERT INTO todo_items (task) VALUES ($1)', [task]);
      res.status(201).send('Task added');
    } catch (err) {
      res.status(500).send('Database error');
    }
  } else {
    inMemoryTodos.push({ id: inMemoryTodos.length + 1, task });
    res.status(201).send('Task added');
  }
});

const server = require.main === module
  ? app.listen(port, () => {
      console.log(`Todo app listening at http://localhost:${port}`);
    })
  : null;

module.exports = app;
module.exports.shutdown = async () => {
  if (db) await db.end();
  if (server) server.close();
};
