const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'jkpg-db',
    port: 5432,
});

async function createAdmin() {
    try {
        await client.connect();
        
        // Check if users table exists, if not create it
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const result = await client.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING id',
            ['admin', hashedPassword]
        );
        
        if (result.rows.length > 0) {
            console.log('Admin user created successfully!');
        } else {
            console.log('Admin user already exists');
        }
        
        console.log('Login credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
        
        await client.end();
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdmin();