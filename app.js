const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csurf = require("tiny-csrf");
const dotenv = require("dotenv");

const app = express();
dotenv.config({ path: "./config.env" });

//import files
const authenticateJwt = require("./middelwares/authenticate");
const userRoute = require("./routes/userRoute");
const appointmentRoute = require("./routes/appointmentRoute");
//parse jsom
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(cors());
//initialize session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
    },
  })
);
app.use((req, res, next) => {
  console.log("cookie", req.cookies);
  console.log(process.env.NODE_ENV);
  next();
});
//app.use(csurf(process.env.CSURF_SECRET, ["POST", "PUT", "DELETE"]));

app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});
//set default view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//render views
app.get("/", authenticateJwt, async (req, res) => {
  if (req.accepts("html")) {
    res.render("index", {
      title: "Online Appointment Platform",
      //csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      user: "user",
      //csrfToken: req.csrfToken(),
    });
  }
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Sign Up",
    csrfToken: request.csrfToken(),
  });
});
app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.use("/users", userRoute);
app.use("/appointemnts", authenticateJwt, appointmentRoute);

module.exports = app;
