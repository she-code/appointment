const { Appointment, User } = require("../models");
const AppError = require("../utils/AppError");
const {
  getTimeRange,
  getPastAppointment,
  getCurrentDateAppointment,
  getUpcomingAppointment,
} = require("../utils/index");

/* Creating an appointment. */
exports.createAppointment = async (req, res) => {
  try {
    //fetch the appointments on that day
    //check if there's an overlapping time
    //create option to delete and add the new one
    //fetch the appointments near to that time range
    // suggest the nearest time range

    const { title, description, to, from, date } = req.body;
    const userId = req.user;

    /* Fetching the appointments on the current day. */
    const appointExists = await Appointment.findAll({
      where: {
        userId,
        date: new Date(date),
      },
      raw: true,
    });

    /* Checking if there is an overlapping time. */
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
    } else {
      // eslint-disable-next-line no-unused-vars
      const appointment = await Appointment.createAppointment({
        userId,
        date,
        title,
        description,
        from,
        to,
      });
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
};

/* Fetching the appointments for the current date. */
exports.getCurrentDateAppointments = async (req, res, next) => {
  //get userId
  //get the current date
  //search appointments based on current date
  //display the appointments

  try {
    const userId = req.user;
    let date = new Date().toISOString().split("T");
    const appointments = await Appointment.getAllApointments(userId);
    const currentData = getCurrentDateAppointment(appointments, date);

    if (!appointments) {
      res
        .status(404)
        .json({ status: "failed", message: "No appointments found" });
    }
    res.status(200).json({ status: "success", currentData });
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
    const appointments = await Appointment.getAllApointments(userId);
    let date = new Date().toISOString().split("T");

    const pastappointments = getPastAppointment(appointments, date);
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
    let date = new Date().toISOString().split("T");
    /* Fetching all the appointments of a user. */
    const appointments = await Appointment.getAllApointments(userId);

    const upcoimngappointments = this.getUpcoimngAppoitment(appointments, date);
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

/* Deleting an appointment. */
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

/* Updating the appointments. */
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

/* Rendering the appointments page. */
exports.renderAppointmentsPage = async (req, res) => {
  const userId = req.user;
  let date = new Date().toISOString().split("T");

  /* Fetching all the appointments of a user. */
  const appointments = await Appointment.getAllApointments(userId);

  /* Fetching the appointments for the current date. */
  const currentData = getCurrentDateAppointment(appointments, date);

  /* Fetching the appointments whose date is previous to the current date. */
  const pastAppointments = getPastAppointment(appointments, date);

  /* Fetching the appointments whose date is next to the current date. */
  const upcoimngAppointments = getUpcomingAppointment(appointments, date);

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
  const user = await User.findByPk(loggedInUser);

  if (!appointment) {
    return next(new AppError("No appointment found with that id", 404));
  }

  if (request.accepts("html")) {
    response.render("editAppointmentPage", {
      title: "Update Appointment",
      appointment,
      user,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      appointment,
    });
  }
};

/* Rendering the add appointment page. */
exports.renderAddAppointmentPage = async (request, response) => {
  const existingData = response.locals.existingData ?? [];
  const formData = response.locals.formData ?? [];
  const userId = request.user;
  const user = await User.findByPk(userId);

  if (request.accepts("html")) {
    response.render("addAppointment", {
      title: "Add Appointment",
      existingData,
      formData,
      user,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      existingData,
    });
  }
};
/* A function that is used to fetch all the appointments of a user. */
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
