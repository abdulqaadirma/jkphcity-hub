const express = require("express");
const router = express.Router();

const venueController = require("../controllers/venueController");
const admin = require("../middleware/adminMiddleware");

router.get("/", venueController.getAllVenues);
router.get("/district/:district", venueController.getVenuesByDistrict);
router.get("/:id", venueController.getVenueById);

router.post("/", admin, venueController.createVenue);
router.put("/:id", admin, venueController.updateVenue);
router.delete("/:id", admin, venueController.deleteVenue);

module.exports = router;