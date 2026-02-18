const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Admin-only upload routes
router.post('/', protect, restrictTo('admin'), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    res.status(201).json({ filePath });
});

router.post('/multiple', protect, restrictTo('admin'), upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Please upload at least one file' });
    }

    const filePaths = req.files.map(file => `/uploads/${file.filename}`);
    res.status(201).json({ filePaths });
});

module.exports = router;
