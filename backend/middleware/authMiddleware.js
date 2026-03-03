const sessions = require('../config/sessionStore');

module.exports = (req, res, next) => {
    const token = req.signedCookies.authToken;
    
    if (!token || !sessions[token]) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    req.user = sessions[token];
    next();
};