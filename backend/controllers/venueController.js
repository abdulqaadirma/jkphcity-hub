const Venue = require("../models/Venue");

exports.getAllVenues = async (req, res) => {
    try {
        const venues = await Venue.findAll();
        res.json(venues);
    } catch (error) {
        console.error('Error in getAllVenues:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findById(parseInt(req.params.id));
        if (!venue) {
            return res.status(404).json({ message: "Venue not found" });
        }
        res.json(venue);
    } catch (error) {
        console.error('Error in getVenueById:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createVenue = async (req, res) => {
    try {
        const venueId = await Venue.create(req.body);
        res.status(201).json({
            message: "Venue created successfully",
            id: venueId, 
            ...req.body
        });
    } catch (error) {
        console.error('Error in createVenue:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateVenue = async (req, res) => {
    try {
        const updated = await Venue.update(parseInt(req.params.id), req.body);
        if (!updated) {
            return res.status(404).json({ message: "Venue not found" });
        }
        res.json({ message: "Venue updated successfully" });
    } catch (error) {
        console.error('Error in updateVenue:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteVenue = async (req, res) => {
    try {
        const deleted = await Venue.delete(parseInt(req.params.id));
        if (!deleted) {
            return res.status(404).json({ message: "Venue not found" });
        }
        res.json({ message: 'Venue deleted successfully' });
    } catch (error) {
        console.error('Error in deleteVenue:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getVenuesByDistrict = async (req, res) => {
    try {
        const venues = await Venue.findByDistrict(req.params.district);
        console.log("controller: \n", venues);
        res.json(venues);
    } catch (error) {
        console.error('Error in getVenuesByDistrict:', error);
        res.status(500).json({ message: error.message });
    }
};