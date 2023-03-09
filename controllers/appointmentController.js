const { parse } = require("date-fns");
const { Appointment } = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");
const _ = require("lodash");
const groups = (() => {
  const byDay = (item) => parse(item.createdAt, "MM-dd-yyyy", new Date()),
    forHour = (item) =>
      byDay(item) + " " + parse(item.createdAt, "hh a", new Date()),
    by6Hour = (item) => {
      const m = parse(item.createdAt);
      return (
        byDay(item) +
        " " +
        ["first", "second", "third", "fourth"][Number(m.format("k")) % 6] +
        " 6 hours"
      );
    },
    forMonth = (item) => parse(item.createdAt, "MMM YYYY", new Date()),
    forWeek = (item) =>
      forMonth(item) + " " + parse(item.createdAt, "ww", new Date());
  return {
    byDay,
    forHour,
    by6Hour,
    forMonth,
    forWeek,
  };
})();
exports.createAppointment = async (req, res, next) => {
  try {
    //fetch the appointments on that day
    //check if there's an overlapping time
    //create option to delete and add the new one
    //fetch the appointments near to that time range
    // suggest the nearest time range
    const { title, description, to, from, date } = req.body;
    const userId = req.user;

    //check if an appointment exists at that time
    const appointExists = await Appointment.findAll({
      where: { userId, date, [Op.between]: [{ from }, { to }] },
    });

    console.log(appointExists);
    res.send(appointExists);
    // const appointment = await Appointment.create({
    //   title,
    //   description,
    //   userId,
    //   to,
    //   from,
    //   date,
    // });
    // console.log(req.body, userId, appointment);
    // if (!appointment) {
    //   return next(new AppError("Unable to create election", 401));
    // }
    // res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
};

exports.getCurrentDateAppointments = async (req, res) => {
  //get userId
  //get the current date
  //search appointemnts based on current date
  //display the appointments

  try {
    const currentUser = req.user;
    const currentDate = new Date();
    const START = new Date();
    START.setHours(0, 0, 0, 0);

    const appointments = await Appointment.getCurrentDateAppointments(
      currentUser,
      START,
      currentDate
    );

    if (!appointments) {
      res.send("unable to find");
    }
    var array = _.groupBy(appointments, groups["forHour"]);
    console.log(appointments);

    //res.send(appointments);
    if (req.accepts("html")) {
      res.render("index", {
        title: "Online Appointment Platform",
        csrfToken: req.csrfToken(),
        appointments,
      });
    } else {
      res.json({
        user: "user",
        csrfToken: req.csrfToken(),
        appointments,
      });
    }
    // res.send(appointemnts);
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    //get current user
    //appointment id
    //check and delete
    const userId = req.user;
    const id = req.params.id;
    await Appointment.deleteAppointment(id, userId);
    return res.json(true);
  } catch (error) {
    console.log(error.message);
    res.json(error.message);
  }
};

exports.updateAppointments = async (req, res, next) => {
  //get userId
  //get appointment id
  // search based on id
  // accept the fields to be updated
  //return updated value
  try {
    const userId = req.user;
    const id = req.params.id;
    const { title, description } = req.body;
    const appointment = await Appointment.getAppointmentByUser(id, userId);
    if (!appointment) {
      return next(new AppError("Appointment not found", 404));
    }
    console.log(appointment);
    const updatedAppointment = await appointment.updateAppointment(
      title,
      description
    );
    console.log(updatedAppointment);
    res.json(updatedAppointment);
  } catch (error) {
    console.log(error.message);
    res.json(error.message);
  }
};

//edit election page
exports.renderUpdateAppointmentPage = async (request, response, next) => {
  const id = request.params.id;
  const loggedInUser = request.user;
  const appointment = await Appointment.getAppointmentDetails(loggedInUser, id);
  if (!appointment) {
    return next(new AppError("No appointment found with that id", 404));
  }

  if (request.accepts("html")) {
    response.render("editAppointmentPage", {
      title: "Update Appointment",
      appointment,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      appointment,
    });
  }
};
