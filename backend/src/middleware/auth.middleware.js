const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret || secret === 'your-super-secret-jwt-key-change-this-in-production') {
            console.error('JWT_SECRET is not properly configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, secret);

        const currentUser = await User.findByPk(decoded.id);
        if (!currentUser || !currentUser.is_active) {
            return res.status(401).json({ error: 'User no longer exists or is inactive' });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please log in again' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to perform this action' });
        }
        next();
    };
};
