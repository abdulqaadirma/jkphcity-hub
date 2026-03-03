const client = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByUsername(username) {
        try {
            const res = await client.query('SELECT * FROM users WHERE username = $1', [username]);
            return res.rows[0];
        } catch (error) {
            console.error('Error in findByUsername:', error);
            throw error;
        }
    }

    static async create(username, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const res = await client.query(
                'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
                [username, hashedPassword]
            );
            return res.rows[0].id;
        } catch (error) {
            console.error('Error in create user:', error);
            throw error;
        }
    }

    static async validatePassword(user, password) {
        try {
            return await bcrypt.compare(password, user.password);
        } catch (error) {
            console.error('Error in validatePassword:', error);
            throw error;
        }
    }
}

module.exports = User;