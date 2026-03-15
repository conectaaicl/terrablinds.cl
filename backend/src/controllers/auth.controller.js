const jwt = require('jsonwebtoken');
const { User } = require('../models');
const emailService = require('../services/email.service');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'your-super-secret-jwt-key-change-this-in-production') {
        throw new Error('JWT_SECRET must be set to a secure value in production');
    }
    return secret;
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            getJwtSecret(),
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Forgot password — sends reset link by email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email requerido' });

        const user = await User.findOne({ where: { email } });

        // Always respond OK to avoid user enumeration
        if (!user || !user.is_active) {
            return res.json({ message: 'Si el email existe, recibirás un enlace en breve.' });
        }

        const secret = getJwtSecret();
        const token = jwt.sign(
            { id: user.id, email: user.email, purpose: 'password-reset' },
            secret,
            { expiresIn: '1h' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'https://terrablinds.cl';
        const resetUrl = `${frontendUrl}/admin/reset-password?token=${token}`;

        try {
            await emailService.sendPasswordResetEmail(user.email, resetUrl);
        } catch (emailErr) {
            // If email fails, log the reset URL so admin can use it directly
            console.warn('Password reset email failed — reset URL:', resetUrl);
        }

        res.json({ message: 'Si el email existe, recibirás un enlace en breve.' });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ error: 'Error interno' });
    }
};

// Reset password — validates token and sets new password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' });
        if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

        const secret = getJwtSecret();
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch {
            return res.status(400).json({ error: 'El enlace ha expirado o es inválido' });
        }

        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({ error: 'Token inválido' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        user.password = password; // hook beforeUpdate hashes it automatically
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ error: 'Error interno' });
    }
};

// Verify token
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        const user = await User.findByPk(decoded.id);

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
