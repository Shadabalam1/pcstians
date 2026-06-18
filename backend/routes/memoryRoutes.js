const express = require('express');
const router = express.Router();

const { 
  uploadMemory, 
  getMemories, 
  deleteMemory,
  addVideoMemory 
} = require('../controllers/memoryController'); 

const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');

// PUBLIC ROUTE: Get all memories
router.get('/', getMemories);

// PROTECTED ROUTE: Upload image memory
router.post('/upload', protect, upload.single('image'), uploadMemory);

// PROTECTED ROUTE: Add YouTube video memory
router.post('/add-video', protect, addVideoMemory);

// PROTECTED ROUTE: Delete memory
router.delete('/:id', protect, deleteMemory);

module.exports = router;