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
    // next(new AppError("Invalid credential. Please log in again!", 401));
    res.redirect("/login");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, verifiedJwt) => {
    if (err) {
      // console.log(err);
      // //check this logic
      // res.redirect("/");
      //   if (req.originalUrl == "/") {
      //     next();
      //   }
      new AppError("Your token has expired! Please log in again.", 401);
    } else {
      req.user = verifiedJwt.id;
      console.log(token);
      console.log("user", req.user);
      // res.status(200).json({"token":verifiedJwt} )

      //check this logic
      // if(req.orginalUrl == '/'){
      //   res.redirect('/elections')
      // }
      next();
    }
  });
};
module.exports = authenticateJwt;
