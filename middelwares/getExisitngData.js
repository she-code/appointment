const getExistingData = (req, res, next) => {
  const existingData = req.session.existingData;
  if (existingData) {
    res.locals.existingData = existingData;
    delete req.session.existingData;
  }
  next();
};

module.exports = getExistingData;
