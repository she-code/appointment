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
      title,
      description,
      userId: currentUser,
      to,
      from,
      date,
    });
    console.log(req.body, currentUser, appointment);
    if (!appointment) {
      return next(new AppError("Unable to create election", 401));
    }
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
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

    const appointemnts = await Appointment.getCurrentDateAppointments(
      currentUser,
      START,
      currentDate
    );

    if (!appointemnts) {
      res.send("unable to find");
    }
    var array = _.groupBy(appointemnts, groups["forHour"]);
    console.log(appointemnts);

    //res.send(appointemnts);
    if (req.accepts("html")) {
      res.render("index", {
        title: "Online Appointment Platform",
        csrfToken: req.csrfToken(),
        appointemnts,
      });
    } else {
      res.json({
        user: "user",
        csrfToken: req.csrfToken(),
        appointemnts,
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
