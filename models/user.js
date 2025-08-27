
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Ensures unique field validation
const schemaCleaner = require('../utils/schemaCleaner');     // Custom utility for cleaning schema output
const { commentSchema } = require('./post');                // Import comment schema for reference


const userSchema = new mongoose.Schema(
  {
    // === AUTHENTICATION FIELDS ===
    username: {
      type: String,
      minlength: 3,        
      maxlength: 20,       
      required: true,      
      trim: true,          
    },
    passwordHash: {
      type: String,
      required: true,      
    },

    // === PROFILE INFORMATION ===
    avatar: {
      exists: {
        type: Boolean,
        default: 'false',  // Track if user has uploaded avatar
      },
      imageLink: {
        type: String,
        trim: true,
        default: 'null',   
      },
      imageId: {
        type: String,
        trim: true,
        default: 'null',   // Image ID for deletion/management
      },
    },

    // === KARMA SYSTEM  ===
    karmaPoints: {
      postKarma: {
        type: Number,
        default: 0,        // Points from post upvotes/downvotes
      },
      commentKarma: {
        type: Number,
        default: 0,        // Points from comment upvotes/downvotes
      },
    },

    // === RELATIONSHIPS (References to other collections) ===
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',       // Array of user's posts (One-to-Many relationship)
      },
    ],
    subscribedSubs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subreddit', // Array of subscribed subreddits (Many-to-Many relationship)
      },
    ],

    // === STATISTICS ===
    totalComments: {
      type: Number,
      default: 0,          
    },
  },
  {
    timestamps: true,      
  }
);

// === PLUGINS AND MIDDLEWARE ===
userSchema.plugin(uniqueValidator); // Validates unique constraints (username uniqueness)

schemaCleaner(userSchema);

module.exports = mongoose.model('User', userSchema);
