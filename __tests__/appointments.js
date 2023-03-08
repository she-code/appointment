const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;
const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

describe("Online Appointment Platform", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });
  test("Check test", () => {
    expect(true).toBe(true);
  });
});
