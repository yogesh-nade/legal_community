
const express = require('express');
const { auth } = require('../utils/middleware'); // JWT authentication middleware
const {
  getPosts,
  getSubscribedPosts,
  getSearchedPosts,
  getPostAndComments,
  createNewPost,
  updatePost,
  deletePost,
} = require('../controllers/post');
const { upvotePost, downvotePost } = require('../controllers/postVote');
const {
  postComment,
  deleteComment,
  updateComment,
  postReply,
  deleteReply,
  updateReply,
} = require('../controllers/postComment');
const {
  upvoteComment,
  downvoteComment,
  upvoteReply,
  downvoteReply,
} = require('../controllers/commentVote');

const router = express.Router();

// === POST CRUD OPERATIONS ===

// GET /api/posts - Get all posts with sorting and pagination (PUBLIC)
// Query params: page, limit, sortby (new/top/hot/controversial/best/old)
router.get('/', getPosts);

// GET /api/posts/search - Search posts by query string (PUBLIC)
// Query params: query, page, limit
router.get('/search', getSearchedPosts);

// GET /api/posts/:id/comments - Get single post with all comments (PUBLIC)
// Returns: post details + nested comment/reply structure
router.get('/:id/comments', getPostAndComments);

// GET /api/posts/subscribed - Get posts from user's subscribed subreddits (PROTECTED)
// Requires: JWT token for user identification
router.get('/subscribed', auth, getSubscribedPosts);

// POST /api/posts - Create new post (PROTECTED)
// Body: { title, postType, textSubmission/linkSubmission/imageSubmission, subreddit }
router.post('/', auth, createNewPost);

// PATCH /api/posts/:id - Update existing post (PROTECTED, AUTHOR ONLY)
// Body: updated post content
router.patch('/:id', auth, updatePost);

// DELETE /api/posts/:id - Delete post (PROTECTED, AUTHOR ONLY)
router.delete('/:id', auth, deletePost);

// === POST VOTING OPERATIONS ===

// POST /api/posts/:id/upvote - Upvote post (PROTECTED)
// Toggles upvote, removes downvote if exists, updates karma
router.post('/:id/upvote', auth, upvotePost);

// POST /api/posts/:id/downvote - Downvote post (PROTECTED)
// Toggles downvote, removes upvote if exists, updates karma
router.post('/:id/downvote', auth, downvotePost);

// === COMMENT CRUD OPERATIONS ===

// POST /api/posts/:id/comment - Add comment to post (PROTECTED)
// Body: { comment }
router.post('/:id/comment', auth, postComment);

// DELETE /api/posts/:id/comment/:commentId - Delete comment (PROTECTED, AUTHOR ONLY)
router.delete('/:id/comment/:commentId', auth, deleteComment);

// PATCH /api/posts/:id/comment/:commentId - Update comment (PROTECTED, AUTHOR ONLY)
// Body: { comment }
router.patch('/:id/comment/:commentId', auth, updateComment);

// === REPLY CRUD OPERATIONS ===

// POST /api/posts/:id/comment/:commentId/reply - Add reply to comment (PROTECTED)
// Body: { reply }
router.post('/:id/comment/:commentId/reply', auth, postReply);

// DELETE /api/posts/:id/comment/:commentId/reply/:replyId - Delete reply (PROTECTED, AUTHOR ONLY)
router.delete('/:id/comment/:commentId/reply/:replyId', auth, deleteReply);

// PATCH /api/posts/:id/comment/:commentId/reply/:replyId - Update reply (PROTECTED, AUTHOR ONLY)
// Body: { reply }
router.patch('/:id/comment/:commentId/reply/:replyId', auth, updateReply);

// === COMMENT VOTING OPERATIONS ===

// POST /api/posts/:id/comment/:commentId/upvote - Upvote comment (PROTECTED)
router.post('/:id/comment/:commentId/upvote', auth, upvoteComment);

// POST /api/posts/:id/comment/:commentId/downvote - Downvote comment (PROTECTED)
router.post('/:id/comment/:commentId/downvote', auth, downvoteComment);

// === REPLY VOTING OPERATIONS ===

// POST /api/posts/:id/comment/:commentId/reply/:replyId/upvote - Upvote reply (PROTECTED)
router.post('/:id/comment/:commentId/reply/:replyId/upvote', auth, upvoteReply);

// POST /api/posts/:id/comment/:commentId/reply/:replyId/downvote - Downvote reply (PROTECTED)
router.post('/:id/comment/:commentId/reply/:replyId/downvote', auth, downvoteReply);

module.exports = router;
