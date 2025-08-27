

const express = require('express');
const { auth } = require('../utils/middleware'); // JWT authentication middleware
const {
  getSubreddits,
  getSubredditPosts,
  getTopSubreddits,
  createNewSubreddit,
  editSubDescription,
  subscribeToSubreddit,
} = require('../controllers/subreddit');

const router = express.Router();

// GET /api/subreddits - Get list of all subreddits (PUBLIC)
// Returns: Array of subreddit names and IDs
router.get('/', getSubreddits);

// GET /api/subreddits/r/:subredditName - Get posts from specific subreddit (PUBLIC)
// Query params: page, limit, sortby (new/top/hot/controversial/best/old)
// Returns: subreddit details + paginated posts
router.get('/r/:subredditName', getSubredditPosts);

// GET /api/subreddits/top10 - Get top 10 subreddits by subscriber count (PUBLIC)
// Returns: Top subreddits sorted by popularity
router.get('/top10', getTopSubreddits);

// POST /api/subreddits - Create new subreddit (PROTECTED)
// Requires: JWT token in Authorization header
// Body: { subredditName, description }
router.post('/', auth, createNewSubreddit);

// PATCH /api/subreddits/:id - Edit subreddit description (PROTECTED)
// Requires: JWT token + admin permission
// Body: { description }
router.patch('/:id', auth, editSubDescription);

// POST /api/subreddits/:id/subscribe - Subscribe/unsubscribe to subreddit (PROTECTED)
// Requires: JWT token in Authorization header
// Toggles subscription status
router.post('/:id/subscribe', auth, subscribeToSubreddit);

module.exports = router;
