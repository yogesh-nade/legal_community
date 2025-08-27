
const mongoose = require('mongoose');
const schemaCleaner = require('../utils/schemaCleaner'); 
/**
 * Reply Schema - Nested replies to comments (2-level nesting: Post -> Comment -> Reply)
 */
const replySchema = new mongoose.Schema({
  // === CONTENT AND AUTHOR ===
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',         // Reference to user who wrote the reply
  },
  replyBody: {
    type: String,
    trim: true,          // The actual reply text content
  },

  // === VOTING SYSTEM ===
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // Array of users who upvoted this reply
    },
  ],
  downvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // Array of users who downvoted this reply
    },
  ],
  pointsCount: {
    type: Number,
    default: 1,          // Net score (upvotes - downvotes), starts at 1 (self-upvote)
  },

  // === TIMESTAMPS ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});





const commentSchema = new mongoose.Schema({
  // === CONTENT AND AUTHOR ===
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',         // Reference to user who wrote the comment
  },
  commentBody: {
    type: String,
    trim: true,          // The actual comment text content
  },

  // === NESTED REPLIES ===
  replies: [replySchema], // Array of nested replies (embedded document pattern)

  // === VOTING SYSTEM ===
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // Array of users who upvoted this comment
    },
  ],
  downvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // Array of users who downvoted this comment
    },
  ],
  pointsCount: {
    type: Number,
    default: 1,          // Net score (upvotes - downvotes), starts at 1 (self-upvote)
  },

  // === TIMESTAMPS ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});





const postSchema = new mongoose.Schema({
  // === BASIC POST INFORMATION ===
  title: {
    type: String,
    required: true,      
    maxlength: 100,      // Limit title length 
    trim: true,
  },
  postType: {
    type: String,
    required: true,      // Defines post type: 'text', 'link', or 'image'
  },

  // === CONTENT TYPES (Only one will be used based on postType) ===
  textSubmission: {
    type: String,
    trim: true,          // For text posts - the main content body
  },
  linkSubmission: {
    type: String,
    trim: true,          // For link posts - URL to external content
  },
  imageSubmission: {
    imageLink: {
      type: String,
      trim: true,       
    },
    imageId: {
      type: String,
      trim: true,        // Image ID for deletion/management
    },
  },

  // === RELATIONSHIPS ===
  subreddit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subreddit',    // Reference to the subreddit this post belongs to
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',         // Reference to the user who created this post
  },

  
  // === VOTING SYSTEM ===
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // Array of users who upvoted this post
    },
  ],
  downvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // Array of users who downvoted this post
    },
  ],
  pointsCount: {
    type: Number,
    default: 1,          // Net score (upvotes - downvotes), starts at 1 (self-upvote)
  },

 
  voteRatio: {
    type: Number,
    default: 0,          // Ratio for controversial post detection
  },
  hotAlgo: {
    type: Number,
    default: Date.now,   // Hot algorithm score (considers time + votes)
  },
  controversialAlgo: {
    type: Number,
    default: 0,          // Controversial algorithm score (balanced up/down votes)
  },

  // === COMMENT SYSTEM ===
  comments: [commentSchema], // Array of embedded comments (nested document pattern)
  commentCount: {
    type: Number,
    default: 0,          
  },

  // === TIMESTAMPS ===
  createdAt: {
    type: Date,
    default: Date.now,   // Post creation timestamp
  },
  updatedAt: {
    type: Date,
    default: Date.now,   // Last update timestamp
  },
});


schemaCleaner(postSchema);
schemaCleaner(commentSchema);
schemaCleaner(replySchema);

module.exports = mongoose.model('Post', postSchema);


module.exports.commentSchema = commentSchema;
