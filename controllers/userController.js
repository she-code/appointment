const bcrypt = require("bcrypt");
const { User } = require("../models");
const { generateJwtToken, generateHashedPassword } = require("../utils/index");

//creates token and saves it in cookies
const createSendToken = (user, req, res) => {
  //generate jwt token
  const token = generateJwtToken(user.id, "User");

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

//register User
exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  //encrypt password
  const hashedPwd = await generateHashedPassword(password);

  //create user
  try {
    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPwd,
    });
    createSendToken(user, req, res);
  } catch (error) {
    console.log(error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      req.flash("error", "Email already exists");
      res.redirect("/signup");
    }
    if (error.name === "SequelizeValidationError") {
      for (var key in error.errors) {
        console.log(error.errors[key].message);
        if (
          error.errors[key].message === "Validation len on firstName failed"
        ) {
          req.flash("error", "First name must have minimum of 2 characters");
        }
        if (error.errors[key].message === "Validation len on lastName failed") {
          req.flash("error", "Last name must have minimum of 2 characters");
        }
        if (
          error.errors[key].message === "Validation isEmail on email failed"
        ) {
          req.flash("error", "Invalid Email");
        }
        if (error.errors[key].message === "Email address already in use!") {
          req.flash("error", "Email address already in use!");
        }
      }
      //   res.redirect("/todos");
      res.redirect("/signup");
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    //search user using email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.flash("error", "No user found");
      res.redirect("/login");
    }
    //compare password
    const passWordCorrect = await bcrypt.compare(password, user.password);
    if (!passWordCorrect) {
      req.flash("error", "Invalid username or password");
      res.redirect("/login");
    }
    if (passWordCorrect) {
      createSendToken(user, req, res);
    }
  } catch (error) {
    console.log(error.message);
  }
};
