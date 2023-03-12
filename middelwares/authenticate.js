/**This middelware authenticates jwt token by fetching it from authorization headers
 * or cookies */

const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authenticateJwt = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    //next(new AppError("Invalid credential. Please log in again!", 401));
    res.redirect("/login");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, verifiedJwt) => {
    if (err) {
      new AppError("Your token has expired! Please log in again.", 401);
    } else {
      req.user = verifiedJwt.id;
      console.log(token);
      console.log("user", req.user);

      next();
    }
  });
};
module.exports = authenticateJwt;
