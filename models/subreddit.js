
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Ensures unique subreddit names
const schemaCleaner = require('../utils/schemaCleaner');     // Custom utility for cleaning schema output


const subredditSchema = new mongoose.Schema(
  {
    // === COMMUNITY IDENTIFICATION ===
    subredditName: {
      type: String,
      required: true,     
      trim: true,          // Remove whitespace
      unique: true,        
    },
    description: {
      type: String,
      required: true,      
      trim: true,
    },

    // === CONTENT RELATIONSHIPS ===
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',       // Array of posts in this subreddit (One-to-Many relationship)
      },
    ],

    // === ADMINISTRATION ===
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',         // Reference to user who created/manages this subreddit
    },

    // === MEMBERSHIP SYSTEM ===
    subscribedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',       // Array of users subscribed to this subreddit (Many-to-Many relationship)
      },
    ],
    subscriberCount: {
      type: Number,
      default: 1,          
    },
  },
  {
    timestamps: true,      // Automatically adds createdAt and updatedAt fields
  }
);


subredditSchema.plugin(uniqueValidator); 
schemaCleaner(subredditSchema);

module.exports = mongoose.model('Subreddit', subredditSchema);
