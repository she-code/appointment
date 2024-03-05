const cheerio = require("cheerio");

//extracts csrf
exports.extractCsrfToken = (res) => {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
};

/* logs in user. */
exports.login = async (agent, email, password, cookie) => {
  let res = await agent.get("/login");
  let csrfToken = this.extractCsrfToken(res);
  res = await agent
    .post("/users/login")
    .send({
      email: email,
      password: password,
      _csrf: csrfToken,
    })
    .set("Cookie", cookie);
};

//create appointment
exports.createAppointment = async (
  agent,
  cookie,
  date,
  from,
  to,
  title,
  description
) => {
  let res = await agent
    .get("/appointments/addAppoinment")
    .set("Cookie", cookie);
  let csrfToken = this.extractCsrfToken(res);
  res = await agent
    .post("/appointments/createAppointment")
    .set("Cookie", cookie)
    .send({
      title: title,
      description: description,
      date: date,
      from: from,
      to: to,
      _csrf: csrfToken,
    });
};
//returns appointment id
exports.parseAppointmentId = async (agent, cookie) => {
  const groupedResponse = await agent
    .get("/")
    .set("Cookie", cookie)
    .set("Accept", "application/json");

  const parsedGroupedResponse = JSON.parse(groupedResponse.text);
  const appointmentsCount = parsedGroupedResponse.currentData.length;

  const latestAppointment =
    parsedGroupedResponse.currentData[appointmentsCount - 1];
  const appointmentId = latestAppointment.id;
  return appointmentId;
};
