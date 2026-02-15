const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    // Return file path relative to server root
    // Assuming we serve 'uploads' statically
    const filePath = `/uploads/${req.file.filename}`;

    res.status(201).json({
        message: 'File uploaded successfully',
        filePath
    });
});

router.post('/multiple', upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Please upload at least one file' });
    }

    const filePaths = req.files.map(file => `/uploads/${file.filename}`);

    res.status(201).json({
        message: 'Files uploaded successfully',
        filePaths
    });
});

module.exports = router;
