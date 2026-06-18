
const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  // Type: 'image' ya 'video'
  type: { 
    type: String, 
    enum: ['image', 'video'], 
    default: 'image' 
  },
  
  // Image ke liye fields
  imageUrl: { type: String },
  cloudinaryId: { type: String },
  
  // Video ke liye fields
  videoUrl: { type: String }, // YouTube URL
  videoId: { type: String }, // YouTube Video ID
  thumbnailUrl: { type: String }, // YouTube thumbnail
  
  // Common fields
  caption: { type: String, required: true },
  hashtags: [{ type: String }],
  year: { 
    type: Number, 
    required: true, 
    enum: [2022, 2023, 2024, 2025, 2026] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Memory', memorySchema);