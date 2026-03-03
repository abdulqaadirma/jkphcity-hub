const express = require("express")
const router = express.Router()

const venueController = require("../controllers/venueController")
const auth = require("../middleware/authMiddleware")

router.get("/", venueController.getAllVenues)
router.get("/:id", venueController.getVenueById)
router.post("", auth, venueController.createVenue)
router.put("/:id", auth, venueController.updateVenue)
router.delete("/:id", auth, venueController.deleteVenue)
router.get("/district/:district", venueController.getVenuesByDistrict)

module.exports = router;