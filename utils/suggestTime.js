const { format, add, differenceInMinutes } = require("date-fns");
const { convertToDate } = require(".");

/* The function tries to find the available slots  based on the existing
appointments. */
exports.suggestTime = (appointments, requestedFrom, requestedTo) => {
  const formattedDate = format(new Date(), "P");
  const splitFrom = requestedFrom?.split(":");
  const splitTo = requestedTo?.split(":");

  //creates from + date
  const inputFrom = add(new Date(formattedDate), {
    hours: splitFrom?.[0],
    minutes: splitFrom?.[1],
    seconds: splitFrom?.[2],
  });

  //creates to  + date
  const inputTo = add(new Date(formattedDate), {
    hours: splitTo?.[0],
    minutes: splitTo?.[1],
    seconds: splitTo?.[2],
  });

  //calculates the required number of minutes
  let reqTime = differenceInMinutes(inputTo, inputFrom);

  //converts the data from data base in to date format
  const converted = convertToDate(appointments);
  const availableSlots = [];

  /* This is the logic to find the available slots. */
  for (let i = 1; i < converted.length; i++) {
    var prev = converted[i - 1]; // get the previous object
    var curr = converted[i];
    let result = differenceInMinutes(curr.from, prev.to);
    if (reqTime == result) {
      availableSlots.push({ from: prev.to, to: curr.from });
    }
  }
  //sortes the avilable slot
  const sortedSlots = availableSlots.sort(
    (a, b) =>
      Math.abs(new Date(a.from) - inputFrom) -
      Math.abs(new Date(b.from) - inputFrom)
  );

  //converts to local time string
  const localSlots = sortedSlots.map((slot) => ({
    from: new Date(slot.from).toLocaleTimeString({
      // timeZone: "Asia/Kolkata",
      hour12: false,
    }),
    to: new Date(slot.to).toLocaleTimeString({
      // timeZone: "Asia/Kolkata",
      hour12: false,
    }),
  }));

  //console.log(localSlots);
  return localSlots;
};
