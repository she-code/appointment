const express = require("express");
const appointmentController = require("../controllers/appointmentController");

const router = express.Router();
router.post("/createAppointment", appointmentController.createAppointment);
module.exports = router;
