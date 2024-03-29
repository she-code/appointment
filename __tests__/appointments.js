const request = require("supertest");

const db = require("../models/index");
const app = require("../app");
const {
  parseAppointmentId,
  extractCsrfToken,
  login,
  createAppointment,
} = require("../utils/testHandlers");
let server, agent;
const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);
let cookie;

describe("Online Voting Platform", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
    let res = await agent.get("/signup");
    let csrfToken = extractCsrfToken(res);
    await agent
      .post("/users/register")
      .type("form")
      .send({
        email: "test2@gmail.com",
        password: "password",
        firstName: "Test",
        lastName: "Haile",
        _csrf: csrfToken,
      })
      .then((res) => {
        const cookies = res.headers["set-cookie"][1]
          .split(",")
          .map((item) => item.split(";")[0]);
        cookie = cookies.join(";");
      });
  });
  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Create appointments", async () => {
    const agent = request.agent(server);
    await login(agent, "test2@gmail.com", "12345678", cookie);

    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let secs = date.getSeconds();
    let from = `${hours}:${minutes}:${secs}`;

    // Adjust to a valid hour (e.g., adding 2 hours)
    let afterHour = hours + 2;
    if (afterHour > 23) {
      afterHour = afterHour - 24; // Adjust to the next day if needed
    }
    let to = `${afterHour}:${minutes}:${secs}`;

    let res = await agent
      .get("/appointments/addAppoinment")
      .set("Cookie", cookie);
    let csrfToken = extractCsrfToken(res);
    res = await agent
      .post("/appointments/createAppointment")
      .set("Cookie", cookie)
      .send({
        title: "Test Appointment",
        description: "checking from test",
        date: date,
        from: from,
        to: to,
        _csrf: csrfToken,
      });
    expect(res.statusCode).toBe(302);
  });

  //edit appointment
  test("Edit the appointment", async () => {
    const agent = request.agent(server);
    await login(agent, "test3@gmail.com", "12345678", cookie);
    //create Election
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let secs = date.getSeconds();
    // let afterHour = hours + 1;

    // let to = `${afterHour + 1}:${minutes}:${secs}`;

    // Adjust to a valid hour (e.g., adding 2 hours)
    let afterHour = hours + 2;
    if (afterHour > 23) {
      afterHour = afterHour - 24; // Adjust to the next day if needed
    }
    let from = `${afterHour}:${minutes}:${secs}`;
    let to = `${afterHour + 1}:${minutes}:${secs}`;
    await createAppointment(
      agent,
      cookie,
      date,
      from,
      to,
      "Test for edit",
      "checking edit"
    );
    // let res = await agent
    //   .get("/appointments/addAppoinment")
    //   .set("Cookie", cookie);
    // let csrfToken = extractCsrfToken(res);
    // res = await agent
    //   .post("/appointments/createAppointment")
    //   .set("Cookie", cookie)
    //   .send({
    //     title: "Test Appointment",
    //     description: "checking from test",
    //     date: date,
    //     from: from,
    //     to: to,
    //     _csrf: csrfToken,
    //   });
    const appointmentId = await parseAppointmentId(agent, cookie);
    //got to edit page
    let res = await agent
      .get(`/appointments/${appointmentId}/edit`)
      .set("Cookie", cookie);
    let csrfToken = extractCsrfToken(res);

    const response = await agent
      .put(`/appointments/${appointmentId}`)
      .set("Cookie", cookie)
      .send({
        title: "Test appointment updated",
        description: "Updated",
        _csrf: csrfToken,
      });
    const updatedAppointment = JSON.parse(response.text);
    expect(updatedAppointment.title).toBe("Test appointment updated");
  });

  //delete Appointment
  test("Delete appointment", async () => {
    const agent = request.agent(server);
    await login(agent, "test3@gmail.com", "12345678", cookie);
    //create Appointment
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let secs = date.getSeconds();
    let afterHour = hours + 1;
    let from = `${afterHour + 1}:${minutes}:${secs}`;
    let to = `${afterHour + 2}:${minutes}:${secs}`;
    await createAppointment(
      agent,
      cookie,
      date,
      from,
      to,
      "Test for delete",
      "checking delete"
    );
    const appointmentId = await parseAppointmentId(agent, cookie);

    let res = await agent
      .get(`/appointments/${appointmentId}/edit`)
      .set("Cookie", cookie);
    let csrfToken = extractCsrfToken(res);

    const response = await agent
      .delete(`/appointments/${appointmentId}`)
      .send({
        _csrf: csrfToken,
      })
      .set("Cookie", cookie);
    const parsedDeletedREsponse = JSON.parse(response.text);

    expect(parsedDeletedREsponse).toBe(true);
  });
});
