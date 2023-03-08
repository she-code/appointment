const express = require("express");
const appointmentController = require("../controllers/appointmentController");

const router = express.Router();
router.post("/createAppointment", appointmentController.createAppointment);
router.get("/daily", appointmentController.getCurrentDateAppointments);
router.patch("/:id/update", appointmentController.updateAppointments);

router.delete("/:id/delete", appointmentController.deleteAppointment);

module.exports = router;
