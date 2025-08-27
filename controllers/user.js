
const User = require('../models/user');
const Post = require('../models/post');
const path = require('path');           // For file path operations
const fs = require('fs');               // For file system operations
const { AVATAR_DIR } = require('../utils/config'); // Avatar storage directory
const paginateResults = require('../utils/paginateResults'); // Pagination utility


const getUser = async (req, res) => {
  const { username } = req.params;
  const page = Number(req.query.page);   // Pagination: current page
  const limit = Number(req.query.limit); // Pagination: posts per page

  
  const user = await User.findOne({
    username: { $regex: new RegExp('^' + username + '$', 'i') },
  });

  if (!user) {
    return res
      .status(404)
      .send({ message: `Username '${username}' does not exist on server.` });
  }

  // Get total post count for pagination calculation
  const postsCount = await Post.find({ author: user.id }).countDocuments();
  
  // Calculate pagination parameters
  const paginated = paginateResults(page, limit, postsCount);
  
  // Fetch user's posts with pagination and population
  const userPosts = await Post.find({ author: user.id })
    .sort({ createdAt: -1 })    // Sort by newest first
    .select('-comments')        // Exclude comments for performance
    .limit(limit)
    .skip(paginated.startIndex)
    .populate('author', 'username')      // Get author username
    .populate('subreddit', 'subredditName'); // Get subreddit name

  // Structure paginated response
  const paginatedPosts = {
    previous: paginated.results.previous,
    results: userPosts,
    next: paginated.results.next,
  };

  res.status(200).json({ userDetails: user, posts: paginatedPosts });
};

/**
 * Set User Avatar - Upload and save user profile picture
 * Handles base64 image conversion and file storage
 */
const setUserAvatar = async (req, res) => {
  const { avatarImage } = req.body; // Base64 encoded image

  if (!avatarImage) {
    return res
      .status(400)
      .send({ message: 'Image data needed for setting avatar.' });
  }

  // Get authenticated user from JWT middleware
  const user = await User.findById(req.user);

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  try {
    // Convert base64 to buffer for file storage
    const base64Data = avatarImage.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename with timestamp
    const fileName = `avatar-${user._id}-${Date.now()}.jpg`;
    const filePath = path.join(AVATAR_DIR, fileName);
    
    // Remove old avatar file if exists (cleanup)
    if (user.avatar && user.avatar.exists && user.avatar.imageId !== 'null') {
      const oldFilePath = path.join(AVATAR_DIR, user.avatar.imageId);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Save new avatar to filesystem
    fs.writeFileSync(filePath, buffer);
    
    // Update user avatar data in database
    user.avatar = {
      exists: true,
      imageLink: `/uploads/avatars/${fileName}`, // Public URL path
      imageId: fileName,                          // Filename for deletion
    };

    const savedUser = await user.save();
    res.status(201).json({ avatar: savedUser.avatar });
  } catch (error) {
    res.status(500).send({ message: 'Error saving avatar: ' + error.message });
  }
};

/**
 * Remove User Avatar - Delete user profile picture
 * Removes file from filesystem and updates database
 */
const removeUserAvatar = async (req, res) => {
  // Get authenticated user from JWT middleware
  const user = await User.findById(req.user);

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  // Remove avatar file from filesystem if exists
  if (user.avatar && user.avatar.exists && user.avatar.imageId !== 'null') {
    const filePath = path.join(AVATAR_DIR, user.avatar.imageId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete file from disk
    }
  }

  // Reset avatar data in database
  user.avatar = {
    exists: false,
    imageLink: 'null',
    imageId: 'null',
  };

  await user.save();
  res.status(204).end(); // No content response for successful deletion
};

module.exports = { getUser, setUserAvatar, removeUserAvatar };
 