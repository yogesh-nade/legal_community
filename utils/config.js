
require('dotenv').config();  // Load environment variables from .env file
const path = require('path');


const PORT = process.env.PORT;          // Server port (default: 3001)
const MONGODB_URI = process.env.MONGODB_URI; // MongoDB connection string
const SECRET = process.env.SECRET;      // JWT secret key for token signing


// Main uploads directory
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Subdirectories for different file types
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');     // User profile pictures
const POST_IMAGE_DIR = path.join(UPLOAD_DIR, 'posts');   // Post images/attachments

module.exports = {
  PORT,
  MONGODB_URI,
  SECRET,
  UPLOAD_DIR,
  AVATAR_DIR,
  POST_IMAGE_DIR,
};
