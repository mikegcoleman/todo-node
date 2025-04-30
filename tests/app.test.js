const request = require('supertest');
const { PostgreSqlContainer } = require('@testcontainers/postgresql');

let app;
let container;

beforeAll(async () => {
  container = await new PostgreSqlContainer()
    .withDatabase('todos')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  const dbHost = container.getHost();
  const dbPort = container.getMappedPort(5432);

  console.log(`Postgres test container started at ${dbHost}:${dbPort}`);

  // Set env var for app.js to use
  process.env.DB_CONNECT = `http://${dbHost}:${dbPort}`;

  // Import app after DB_CONNECT is set
  app = require('../app');
}, 30000);

afterAll(async () => {
  if (app && app.shutdown) {
    await app.shutdown();
  }
  if (container) {
    await container.stop();
  }
});

test('POST /todos and GET /todos', async () => {
  const task = 'Write integration test';

  const postRes = await request(app)
    .post('/todos')
    .send({ task });

  expect(postRes.statusCode).toBe(201);

  const getRes = await request(app).get('/todos');
  expect(getRes.statusCode).toBe(200);
  expect(getRes.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ task }),
    ])
  );
}, 30000);
