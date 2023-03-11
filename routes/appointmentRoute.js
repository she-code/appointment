const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const existingData = require("../middelwares/getExisitngData");
const router = express.Router();
router.post("/createAppointment", appointmentController.createAppointment);
router.get("/daily", appointmentController.getCurrentDateAppointments);
router.get("/past", appointmentController.getPastAppoitments);
router.get("/upcoming", appointmentController.getUpcoimngAppoitments);

router.put("/:id", appointmentController.updateAppointments);
router.get("/:id/edit", appointmentController.renderUpdateAppointmentPage);
router.delete("/:id", appointmentController.deleteAppointment);
router.get("/", appointmentController.getAllAppointments);
router.get(
  "/addAppoinment",
  existingData,
  appointmentController.renderAddAppointmentPage
);
router.get(appointmentController.getAllAppointments);
module.exports = router;
