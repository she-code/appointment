const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  areIntervalsOverlapping,
  add,
  format,
  parseISO,
  isBefore,
  isAfter,
  isEqual,
} = require("date-fns");
exports.generateHashedPassword = async (cleanPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(cleanPassword, salt);
  return hashedPassword;
};

/* This is a function that is used to generate a JWT token. */
exports.generateJwtToken = (userId, userType, expiresIn = "0.5y") => {
  const token = jwt.sign(
    { id: userId, userType: userType },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
  return token;
};

exports.getTimeRange = (data, from, to) => {
  /** Stores the overlapping time intervals */
  const overlappingZones = [];
  data.forEach((doc) => {
    /** check if the doc have all the required  */
    if (doc?.from && doc?.to && doc?.date) {
      /**  format the current date =>  */
      const formattedDate = format(new Date(doc?.date), "P");
      /** split the input fields */
      const splitFrom = from?.split(":");
      const splitTo = to?.split(":");

      /** split the "from" and "to" values from the doc */
      const splitDocFrom = doc?.from.split(":");
      const splitDocTo = doc?.to.split(":");

      /** add the splitted time's to the formatted date */
      const docFrom = add(new Date(formattedDate), {
        hours: splitDocFrom?.[0],
        minutes: splitDocFrom?.[1],
        seconds: splitDocFrom?.[2],
      });
      const docTo = add(new Date(formattedDate), {
        hours: splitDocTo?.[0],
        minutes: splitDocTo?.[1],
        seconds: splitDocTo?.[2],
      });

      const inputFrom = add(new Date(formattedDate), {
        hours: splitFrom?.[0],
        minutes: splitFrom?.[1],
        seconds: splitFrom?.[2],
      });
      const inputTo = add(new Date(formattedDate), {
        hours: splitTo?.[0],
        minutes: splitTo?.[1],
        seconds: splitTo?.[2],
      });

      /**  check if the intervals are overlapping */
      const isOverlapping = areIntervalsOverlapping(
        { start: new Date(docFrom), end: new Date(docTo) },
        { start: new Date(inputFrom), end: new Date(inputTo) }
      );
      /**  if overlapping, push value to "overlappingZones" array */
      if (isOverlapping) overlappingZones.push(doc);
      //  console.log(overlappingZones, "overLap");
    }
  });
  return overlappingZones;
};

//creates token and saves it in cookies
exports.createSendToken = (user, req, res) => {
  //generate jwt token
  const token = this.generateJwtToken(user.id, "User");

  const cookieOPtions = {
    expiresIn: "60d",
    httpOnly: true,
  };
  if (process.env.NODE_ENV == "production") cookieOPtions.secure = true;

  res.cookie("jwt", token, cookieOPtions);
  console.log(user);
  //redirect to elections page
  res.redirect("/");
};

exports.getPastAppointment = (appointments, date) => {
  const pastAppointments = [];
  appointments.forEach((element) => {
    const onlyDate = new Date(element.date).toISOString().split("T");
    if (isBefore(parseISO(onlyDate[0]), parseISO(date[0]))) {
      pastAppointments.push(element);
    }
  });
  return pastAppointments;
};
/* Fetching the appointments for the current date. */
exports.getCurrentDateAppointment = (appointments, date) => {
  let currentData = [];
  appointments.forEach((element) => {
    const onlyDate = new Date(element.date).toISOString().split("T");
    if (isEqual(parseISO(date[0]), parseISO(onlyDate[0]))) {
      currentData.push(element);
    }
  });
  return currentData;
};

/* Fetching the upcoming appointments. */
exports.getUpcomingAppointment = (appointments, date) => {
  let upcoimngAppointments = [];
  appointments.forEach((element) => {
    const onlyDate = new Date(element.date).toISOString().split("T");
    if (isAfter(parseISO(onlyDate[0]), parseISO(date[0]))) {
      upcoimngAppointments.push(element);
    }
  });
  return upcoimngAppointments;
};

exports.convertToDate = (data) => {
  const convertedDates = [];
  data.forEach((doc) => {
    /** check if the doc have all the required  */
    if (doc?.from && doc?.to && doc?.date) {
      /**  format the current date =>  */
      const formattedDate = format(new Date(doc?.date), "P");
      /** split the "from" and "to" values from the doc */
      const splitDocFrom = doc?.from.split(":");
      const splitDocTo = doc?.to.split(":");

      /** add the splitted time's to the formatted date */
      const docFrom = add(new Date(formattedDate), {
        hours: splitDocFrom?.[0],
        minutes: splitDocFrom?.[1],
        seconds: splitDocFrom?.[2],
      });
      const docTo = add(new Date(formattedDate), {
        hours: splitDocTo?.[0],
        minutes: splitDocTo?.[1],
        seconds: splitDocTo?.[2],
      });
      convertedDates.push({ from: docFrom, to: docTo });
    }
  });
  return convertedDates;
};
