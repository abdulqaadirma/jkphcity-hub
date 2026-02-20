const db = require("../config/database")

class Venue {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM venues');
        return rows;
    }

    static async findById(id){
        const [row] = await db.query("SELECT * FROM venues WHERE id = ?", [id])
        return row[0]
    }

    static async create(venueData){
        const {name, url, district, category, phone, description} = venueData
        const [result] = await db.query("INSERT INTO venues (name, url, district, category, phone, description) values(?,?,?,?,?,?)", 
            [name, url, district, category, phone, description])
        
        return result.insertId
    }

    static async update(id, venueData){
        const {name, url, district, category, phone, description} = venueData
        const [result] = await db.query("UPDATE venues SET name=?, url=?, district=?, category=?, phone=?, description=? WHERE id = ?", 
            [name, url, district, category, phone, description, id])
        
        return result.affectedRows > 0
    }
}

module.exports = Venue;