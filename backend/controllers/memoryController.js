// backend/controllers/memoryController.js
const cloudinary = require('../config/cloudinary');
const Memory = require('../models/Memory');

// Helper function: Buffer ko Cloudinary par upload karne ke liye
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'pcstians_memories' }, // Cloudinary par folder ka naam
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc    Upload a new memory
// @route   POST /api/memories/upload
exports.uploadMemory = async (req, res) => {
  try {
    const { caption, hashtags, year } = req.body;

    // Check karein ki image upload hui hai ya nahi
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // 1. Image ko Cloudinary par upload karein
    const result = await uploadToCloudinary(req.file.buffer);

    // 2. Hashtags ko parse karein (Agar string mein comma-separated aaye hain toh array mein badlein)
    let parsedHashtags = [];
    if (hashtags) {
      if (typeof hashtags === 'string') {
        parsedHashtags = hashtags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(hashtags)) {
        parsedHashtags = hashtags;
      }
    }

    // 3. Memory ki details ko MongoDB mein save karein
    const newMemory = new Memory({
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      caption,
      hashtags: parsedHashtags,
      year: parseInt(year)
    });

    await newMemory.save();

    // Success response bhejein
    res.status(201).json({
      success: true,
      message: 'Memory uploaded successfully',
      data: newMemory
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all memories (with search and filter)
// @route   GET /api/memories
exports.getMemories = async (req, res) => {
  try {
    const { year, search } = req.query;
    let query = {};

    // Filter by year
    if (year && year !== 'all') {
      query.year = parseInt(year);
    }

    // Search by caption or hashtags (case-insensitive)
    if (search) {
      query.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { hashtags: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch from DB (newest first)
    const memories = await Memory.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: memories.length,
      data: memories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a memory
// @route   DELETE /api/memories/:id
// exports.deleteMemory = async (req, res) => {
//   try {
//     // 1. Database se memory dhundhein
//     const memory = await Memory.findById(req.params.id);
    
//     if (!memory) {
//       return res.status(404).json({ message: 'Memory not found' });
//     }

//     // 2. Cloudinary se image delete karein
//     await cloudinary.uploader.destroy(memory.cloudinaryId);

//     // 3. MongoDB se record delete karein
//     await memory.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: 'Memory deleted successfully'
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };


// @desc    Delete a memory (Image or Video)
// @route   DELETE /api/memories/:id
exports.deleteMemory = async (req, res) => {
  try {
    // 1. Database se memory dhundhein
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // 2. ✅ FIX: Agar memory 'image' hai, tabhi Cloudinary se delete karein
    if (memory.type === 'image' && memory.cloudinaryId) {
      await cloudinary.uploader.destroy(memory.cloudinaryId);
    }
    // Agar 'video' hai, toh Cloudinary wala step skip ho jayega

    // 3. MongoDB se record delete karein
    await memory.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Memory deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Helper function: YouTube Video ID extract karne ke liye
const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// @desc    Add YouTube video memory
// @route   POST /api/memories/add-video
exports.addVideoMemory = async (req, res) => {
  try {
    const { videoUrl, caption, hashtags, year } = req.body;

    // YouTube Video ID extract karein
    const videoId = getYouTubeVideoId(videoUrl);
    
    if (!videoId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    // YouTube thumbnail URL banayein
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Hashtags ko parse karein
    let parsedHashtags = [];
    if (hashtags) {
      if (typeof hashtags === 'string') {
        parsedHashtags = hashtags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(hashtags)) {
        parsedHashtags = hashtags;
      }
    }

    // Video memory create karein
    const newVideoMemory = new Memory({
      type: 'video',
      videoUrl,
      videoId,
      thumbnailUrl,
      caption,
      hashtags: parsedHashtags,
      year: parseInt(year)
    });

    await newVideoMemory.save();

    res.status(201).json({
      success: true,
      message: 'Video memory added successfully',
      data: newVideoMemory
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};