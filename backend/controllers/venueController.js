const Venue = require("../models/Venue")

exports.getAllVenues = async (req, res)=>{
    try {
        const venues = await Venue.findAll();
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getvenueById = async (req, res)=>{
    try{
        const venue = await Venue.findById(parseInt(req.params.id));
        res.json(venue)
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createVenue = async (req, res) =>{
    try{
        const venueId = await Venue.create(req.body)
        res.status(201).json({
            message: "Venue createed successfully",
            id: venueId, ...req.body
        })
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateVenue = async (req, res)=>{
    try{
        const updated = await Venue.update(parseInt(req.params.id), req.body)
        if(!updated){
            res.status(404).json({message: "Venue not found"})
        }
        res.json({message: "Venue updated successfully"})
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}