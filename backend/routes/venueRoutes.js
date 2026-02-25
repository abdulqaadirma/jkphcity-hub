const express = require("express")
const router = express.Router()

const venueController = require("../controllers/venueController")

router.get("/api/venues", venueController.getAllVenues)
router.get("/api/venues/:id", venueController.getVenueById)
router.post("/api/venues", venueController.createVenue)
router.put("/api/venues/:id", venueController.updateVenue)
router.delete("/api/venues/:id", venueController.deleteVenue)
router.get("/api/venues/district/:district", venueController.getVenuesByDistrict)

module.exports = router;