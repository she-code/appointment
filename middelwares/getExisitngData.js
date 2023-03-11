const getExistingData = (req, res, next) => {
  const existingData = req.session.existingData;
  const formData = req.session.formData;
  if (existingData) {
    res.locals.existingData = existingData;
    delete req.session.existingData;
  }
  if (formData) {
    res.locals.formData = formData;
    delete req.session.formData;
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
  next();
};

module.exports = getExistingData;
