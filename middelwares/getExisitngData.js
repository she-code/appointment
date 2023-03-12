/**
 * It checks if there is any existing data in the session, if there is, it will assign it to the
 * res.locals object, and then delete it from the session.
 * @param req - The request object represents the HTTP request and has properties for the request query
 * string, parameters, body, HTTP headers, and so on.
 * @param res - the response object
 * @param next - The callback function that will be called when the middleware is done.
 */
const getExistingData = (req, res, next) => {
  const existingData = req.session.existingData;
  const formData = req.session.formData;
  const suggestedTime = req.session.suggestedTime;

  /* Checking if there is any existing data in the session, if there is, it will assign it to the
   * res.locals object, and then delete it from the session. */
  if (existingData) {
    res.locals.existingData = existingData;
    delete req.session.existingData;
  }
  if (formData) {
    res.locals.formData = formData;
    delete req.session.formData;
  }
  if (suggestedTime) {
    res.locals.suggestedTime = suggestedTime;
    delete req.session.suggestedTime;
  }
  // clear the form input values from session when redirected to another page
  if (
    req.session.formData &&
    req.originalUrl !== "/appointments/addAppoinment"
  ) {
    delete req.session.formData;
  }

  // clear the existing appointment data from session when redirected to another page
  if (
    req.session.existingData &&
    req.originalUrl !== "/appointments/addAppoinment"
  ) {
    delete req.session.existingData;
  }
  if (
    req.session.suggestedTime &&
    req.originalUrl !== "/appointments/addAppoinment"
  ) {
    delete req.session.suggestedTime;
  }
  next();
};

module.exports = getExistingData;
