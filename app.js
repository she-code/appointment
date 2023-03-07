const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const csurf = require("tiny-csrf");
const dotenv = require("dotenv");

const app = express();
dotenv.config({ path: "./config.env" });

app.use(cors());
app.use(morgan("dev"));
app.use(csurf(process.env.CSURF_SECRET, ["POST", "PUT", "DELETE"]));
app.use(express.json());

app.use("/", (req, res) => {
  res.send("Welcome");
});
module.exports = app;
