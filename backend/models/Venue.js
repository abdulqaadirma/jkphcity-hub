const client = require('../config/database');

class Venue {
    static async findAll() {
        try {
            const res = await client.query('SELECT * FROM venues ORDER BY name');
            return res.rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const res = await client.query('SELECT * FROM venues WHERE id = $1', [id]);
            return res.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(venueData) {
        const { name, url, district, category, phone, description } = venueData;
        const query = `
            INSERT INTO venues (name, url, district, category, phone, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        
        try {
            const res = await client.query(query, [name, url, district, category, phone, description]);
            return res.rows[0].id;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, venueData) {
        const { name, url, district, category, phone, description } = venueData;
        const query = `
            UPDATE venues 
            SET name = $1, url = $2, district = $3, category = $4, phone = $5, description = $6
            WHERE id = $7
            RETURNING id
        `;
        
        try {
            const res = await client.query(query, [name, url, district, category, phone, description, id]);
            return res.rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const res = await client.query('DELETE FROM venues WHERE id = $1 RETURNING id', [id]);
            return res.rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    static async findByDistrict(district) {
        try {
            const res = await client.query('SELECT * FROM venues WHERE district = $1 ORDER BY name', [district]);
            return res.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Venue;