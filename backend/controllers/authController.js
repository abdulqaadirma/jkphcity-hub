const User = require('../models/User');
const crypto = require('crypto');
const sessions = require('../config/sessionStore');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userId = await User.create(username, password);
        
        // Create session token
        const token = crypto.randomBytes(64).toString('hex');
        sessions[token] = { id: userId, username };

        console.log(sessions)
        
        // Set cookie
        res.cookie('authToken', token, { 
            signed: true, 
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.status(201).json({ message: 'User created successfully', username });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await User.validatePassword(user, password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create session token
        const token = crypto.randomBytes(64).toString('hex');
        sessions[token] = { id: user.id, username: user.username };
        
        // Set cookie
        res.cookie('authToken', token, { 
            signed: true, 
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({ message: 'Login successful', username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    const token = req.signedCookies.authToken;
    if (token && sessions[token]) {
        delete sessions[token];
    }
    res.clearCookie('authToken');
    res.json({ message: 'Logout successful' });
};

exports.checkAuth = (req, res) => {
    const token = req.signedCookies.authToken;
    if (token && sessions[token]) {
        res.json({ authenticated: true, username: sessions[token].username });
    } else {
        res.json({ authenticated: false });
    }
};