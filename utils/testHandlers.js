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

//returns appointment id
exports.parseAppointmentId = async (agent, cookie) => {
  const groupedResponse = await agent
    .get("/")
    .set("Cookie", cookie)
    .set("Accept", "application/json");

  const parsedGroupedResponse = JSON.parse(groupedResponse.text);
  const appointmentsCount = parsedGroupedResponse.currentData.length;
  console.log({ appointmentsCount });
  console.log({ parsedGroupedResponse });
  const latestAppointment =
    parsedGroupedResponse.currentData[appointmentsCount - 1];
  const appointmentId = latestAppointment.id;
  return appointmentId;
};
