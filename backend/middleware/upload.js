// backend/middleware/upload.js
const multer = require('multer');

// Image ko memory (buffer) mein store karein
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maximum 5MB file size
  fileFilter: (req, file, cb) => {
    // Sirf JPG, PNG aur WEBP allow karein
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'));
    }
  }
});

module.exports = upload;