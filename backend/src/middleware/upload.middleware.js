const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowedExts.includes(ext)) {
            return cb(new Error('File extension not allowed'));
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpg, png, gif, webp).'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 8
    }
});

// Post-multer middleware: compress/resize images with Sharp (skip GIFs)
const compressImage = async (req, res, next) => {
    let sharp;
    try { sharp = require('sharp'); } catch (_) {
        // sharp not installed — skip compression silently
        return next();
    }

    const files = req.file ? [req.file] : (req.files || []);
    if (!files.length) return next();

    for (const file of files) {
        const ext = path.extname(file.filename).toLowerCase();
        if (ext === '.gif' || ext === '.webp') continue; // skip already-optimal formats

        const newFilename = file.filename.replace(/\.[^.]+$/, '.webp');
        const newPath = path.join(uploadDir, newFilename);

        try {
            await sharp(file.path)
                .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(newPath);

            fs.unlinkSync(file.path);

            file.filename = newFilename;
            file.path = newPath;
            file.mimetype = 'image/webp';
        } catch (err) {
            console.error('Sharp compression error:', err.message);
            // keep original if sharp fails
        }
    }
    next();
};

module.exports = upload;
module.exports.compressImage = compressImage;
