const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { areIntervalsOverlapping, add, format } = require("date-fns");

exports.generateHashedPassword = async (cleanPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(cleanPassword, salt);
  return hashedPassword;
};

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
  // console.log(data, "getTime");
  const overlappingZones = [];
  data.forEach((doc) => {
    /** check if the doc have all the required @keys */
    if (doc?.from && doc?.to && doc?.date) {
      /** step 1. format the current date => @returns 20/01/01 format */
      const formattedDate = format(new Date(doc?.date), "P");
      /** step 2. split the input fields */
      const splitFrom = from?.split(":"); /** @return [18, 30, 00] */
      const splitTo = to?.split(":"); /** @return [18, 30, 00] */

      /** step 3. split the "from" and "to" values from the doc */
      const splitDocFrom = doc?.from.split(":");
      const splitDocTo = doc?.to.split(":");

      /** step 4. add the splitted time's to the formatted date */
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

      /** step 5. check if the intervals are overlapping */
      const isOverlapping = areIntervalsOverlapping(
        { start: new Date(docFrom), end: new Date(docTo) },
        { start: new Date(inputFrom), end: new Date(inputTo) }
      );
      /** step 6. if overlapping, push value to "overlappingZones" array */
      if (isOverlapping) overlappingZones.push(doc);
      //  console.log(overlappingZones, "overLap");
    }
  });
  return overlappingZones;
};
