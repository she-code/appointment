const { Appointment, User } = require("../models");
const AppError = require("../utils/AppError");
const { getTimeRange } = require("../utils/index");
const { Op } = require("sequelize");
const { isEqual, parseISO, isBefore, isAfter } = require("date-fns");
exports.createAppointment = async (req, res) => {
  try {
    //fetch the appointments on that day
    //check if there's an overlapping time
    //create option to delete and add the new one
    //fetch the appointments near to that time range
    // suggest the nearest time range
    const { title, description, to, from, date } = req.body;
    const userId = req.user;

    const appointExists = await Appointment.findAll({
      where: {
        userId,
        date: new Date(date),
      },
      raw: true,
    });

    // store the form input values in session
    const checkExisitng = getTimeRange(appointExists, from, to);

    if (checkExisitng.length > 0) {
      req.session.existingData = checkExisitng;
      req.session.formData = {
        title,
        description,
        date,
        from,
        to,
      };
      req.flash(
        "error",
        "Appointments exist in the given time slot. You can view and delete existing appointments."
      );
      return res.redirect("/appointments/addAppoinment");
      // return res.json(checkExisitng);
    } else {
      const appointment = await Appointment.createAppointment({
        userId,
        date,
        title,
        description,
        from,
        to,
      });
      console.log(appointment, "created");
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
};

exports.getCurrentDateAppointments = async (req, res, next) => {
  //get userId
  //get the current date
  //search appointments based on current date
  //display the appointments

  try {
    const userId = req.user;

    const currentData = [];
    let date = new Date().toISOString().split("T");
    const appointments = await Appointment.getAllApointments(userId);
    appointments.forEach((element) => {
      const split = new Date(element.date).toISOString().split("T");
      if (isEqual(parseISO(date[0]), parseISO(split[0]))) {
        currentData.push(element);
      }
    });

    if (!appointments) {
      res
        .status(404)
        .json({ status: "failed", message: "No appointments found" });
    }
    res.status(200).json({ status: "success", appointments });
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message));
  }
};

exports.getPastAppoitments = async (req, res) => {
  //get user ID
  //get current date
  //fetch the datas whose dare is previous to current date
  try {
    const userId = req.user;
    const currentDate = new Date();
    const pastappointments = await Appointment.getPastAppointments(
      userId,
      currentDate
    );
    res.status(200).json({
      status: "success",
      result: pastappointments.length,
      pastappointments,
    });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
};
exports.getUpcoimngAppoitments = async (req, res) => {
  //get user ID
  //get current date
  //fetch the datas whose date is next to current date
  try {
    const userId = req.user;
    const currentDate = new Date();
    const upcoimngappointments = await Appointment.getUpcoimngAppoitments(
      userId,
      currentDate
    );
    res.status(200).json({
      status: "success",
      result: upcoimngappointments.length,
      upcoimngappointments,
    });
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

exports.renderAppointmentsPage = async (req, res) => {
  const userId = req.user;
  const currentData = [];
  const pastAppointments = [];
  const upcoimngAppointments = [];
  let date = new Date().toISOString().split("T");

  /* Fetching the appointments for the current date. */
  const appointments = await Appointment.getAllApointments(userId);
  appointments.forEach((element) => {
    const onlyDate = new Date(element.date).toISOString().split("T");
    if (isEqual(parseISO(date[0]), parseISO(onlyDate[0]))) {
      currentData.push(element);
    }
  });
  /* Fetching the upcoming appointments. */
  appointments.forEach((element) => {
    const onlyDate = new Date(element.date).toISOString().split("T");
    if (isAfter(parseISO(onlyDate[0]), parseISO(date[0]))) {
      upcoimngAppointments.push(element);
      console.log(onlyDate[0]);
    }
  });

  /* Fetching the previous appointments. */
  appointments.forEach((element) => {
    const onlyDate = new Date(element.date).toISOString().split("T");
    if (isBefore(parseISO(onlyDate[0]), parseISO(date[0]))) {
      pastAppointments.push(element);
      console.log(onlyDate[0]);
    }
  });
  //get user details
  const user = await User.findByPk(userId);
  //render the ui
  if (req.accepts("html")) {
    res.render("index", {
      title: "Online Appointment Platform",
      csrfToken: req.csrfToken(),
      currentData,
      upcoimngAppointments,
      pastAppointments,
      user,
    });
  } else {
    res.json({
      user: "user",
      csrfToken: req.csrfToken(),
      currentData,
      upcoimngAppointments,
      pastAppointments,
    });
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

exports.renderAddAppointmentPage = async (request, response) => {
  const existingData = response.locals.existingData ?? [];
  const formData = response.locals.formData ?? [];

  if (request.accepts("html")) {
    response.render("addAppointment", {
      title: "Add Appointment",
      existingData,
      formData,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      existingData,
    });
  }
};
exports.getAllAppointments = async (req, res) => {
  const userId = req.user;

  const appoints = await Appointment.findAll({
    where: {
      userId,
    },
    order: [["createdAt", "DESC"]],
  });

  res.json(appoints);
};
