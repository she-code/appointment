const { parse } = require("date-fns");
const { Appointment } = require("../models/appointment");

exports.createAppointment = async (req, res) => {
  try {
    //fetch the appointments on that day
    //check if there's an overlapping time
    //create option to delete and add the new one
    //fetch the appointments near to that time range
    // suggest the nearest time range
    const { title, description, to, from, stringDate } = req.body;
    const currentUser = req.user;
    const date = parse(stringDate, "MM-dd-yyyy", new Date());
    const toDb = parse(to, "hh:m:ss", new Date());
    const fromDb = parse(from, "hh:m:ss", new Date());

    console.log(req.body, currentUser, date);

    console.log(toDb.getHours()); // 9
    console.log(toDb.getDate()); // 15
    console.log(toDb, fromDb); // 2022-06-15T08:13:50.000Z

    const appointment = await Appointment.create({
      title: title,
      description: description,
      userId: currentUser,
      to: to,
      from: from,
      date: date,
    });
    // res.send(req.body);
    console.log(req.body, currentUser, date);
    if (!appointment) {
      res.send(appointment);
    }
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};
