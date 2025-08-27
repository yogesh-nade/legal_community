
const Post = require('../models/post');
const User = require('../models/user');
const numOfComments = require('../utils/numOfComments'); // Utility to count total comments

/**
 * Post Comment - Add new comment to a post
 * Creates comment with auto-upvote and updates user karma
 */
const postComment = async (req, res) => {
  const { id } = req.params;  // Post ID
  const { comment } = req.body; // Comment content

  if (!comment) {
    return res.status(400).send({ message: `Comment body can't be empty.` });
  }

  // Get post and authenticated user
  const post = await Post.findById(id);
  const user = await User.findById(req.user);

  if (!post) {
    return res.status(404).send({
      message: `Post with ID: ${id} does not exist in database.`,
    });
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  // Add comment to post with auto-upvote (Reddit behavior)
  post.comments = post.comments.concat({
    commentedBy: user._id,
    commentBody: comment,
    upvotedBy: [user._id],     // Auto-upvote by author
    pointsCount: 1,            // Start with 1 point (self-upvote)
  });
  
  // Update cached comment count for performance
  post.commentCount = numOfComments(post.comments);
  const savedPost = await post.save();
  
  // Populate author information for response
  const populatedPost = await savedPost
    .populate('comments.commentedBy', 'username')
    .execPopulate();

  // Update user karma and comment count
  user.karmaPoints.commentKarma++;
  user.totalComments++;
  await user.save();

  // Return the newly added comment
  const addedComment = populatedPost.comments[savedPost.comments.length - 1];
  res.status(201).json(addedComment);
};

/**
 * Delete Comment - Remove comment from post
 * Only comment author can delete their own comments
 */
const deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  // Get post and authenticated user
  const post = await Post.findById(id);
  const user = await User.findById(req.user);

  if (!post) {
    return res.status(404).send({
      message: `Post with ID: ${id} does not exist in database.`,
    });
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  // Find target comment within post
  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  // Verify comment ownership (authorization)
  if (targetComment.commentedBy.toString() !== user._id.toString()) {
    return res.status(401).send({ message: 'Access is denied.' });
  }

  // Remove comment from post and update count
  post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
  post.commentCount = numOfComments(post.comments);

  await post.save();
  res.status(204).end(); // No content response for successful deletion
};

/**
 * Update Comment - Edit existing comment content
 * Only comment author can edit their own comments
 */
const updateComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).send({ message: `Comment body can't be empty.` });
  }

  // Get post and authenticated user
  const post = await Post.findById(id);
  const user = await User.findById(req.user);

  if (!post) {
    return res.status(404).send({
      message: `Post with ID: ${id} does not exist in database.`,
    });
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  // Find target comment within post
  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  // Verify comment ownership (authorization)
  if (targetComment.commentedBy.toString() !== user._id.toString()) {
    return res.status(401).send({ message: 'Access is denied.' });
  }

  // Update comment content and timestamp
  targetComment.commentBody = comment;
  targetComment.updatedAt = Date.now();

  // Update comment in post array
  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );

  await post.save();
  res.status(202).end(); // Accepted response for successful update
};

/**
 * Post Reply - Add reply to existing comment
 * Implements 2-level nesting: Post → Comment → Reply
 */
const postReply = async (req, res) => {
  const { id, commentId } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).send({ message: `Reply body can't be empty.` });
  }

  // Get post and authenticated user
  const post = await Post.findById(id);
  const user = await User.findById(req.user);

  if (!post) {
    return res.status(404).send({
      message: `Post with ID: ${id} does not exist in database.`,
    });
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  // Find target comment to reply to
  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  // Add reply to comment with auto-upvote
  targetComment.replies = targetComment.replies.concat({
    replyBody: reply,
    repliedBy: user._id,
    upvotedBy: [user._id],     // Auto-upvote by author
    pointsCount: 1,            // Start with 1 point (self-upvote)
  });

  // Update comment in post array and recalculate total comment count
  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );
  post.commentCount = numOfComments(post.comments);
  const savedPost = await post.save();
  
  // Populate reply author information for response
  const populatedPost = await savedPost
    .populate('comments.replies.repliedBy', 'username')
    .execPopulate();

  // Update user karma and comment count (replies count as comments)
  user.karmaPoints.commentKarma++;
  user.totalComments++;
  await user.save();

  // Find and return the newly added reply
  const commentToReply = populatedPost.comments.find(
    (c) => c._id.toString() === commentId
  );

  const addedReply = commentToReply.replies[commentToReply.replies.length - 1];
  res.status(201).json(addedReply);
};

/**
 * Delete Reply - Remove reply from comment
 * Only reply author can delete their own replies
 */
const deleteReply = async (req, res) => {
  const { id, commentId, replyId } = req.params;

  // Get post and authenticated user
  const post = await Post.findById(id);
  const user = await User.findById(req.user);

  if (!post) {
    return res.status(404).send({
      message: `Post with ID: ${id} does not exist in database.`,
    });
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  // Find target comment containing the reply
  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  // Find target reply within comment
  const targetReply = targetComment.replies.find(
    (r) => r._id.toString() === replyId
  );

  if (!targetReply) {
    return res.status(404).send({
      message: `Reply comment with ID: '${replyId}'  does not exist in database.`,
    });
  }

  // Verify reply ownership (authorization)
  if (targetReply.repliedBy.toString() !== user._id.toString()) {
    return res.status(401).send({ message: 'Access is denied.' });
  }

  // Remove reply from comment and update counts
  targetComment.replies = targetComment.replies.filter(
    (r) => r._id.toString() !== replyId
  );

  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );
  post.commentCount = numOfComments(post.comments);

  await post.save();
  res.status(204).end(); // No content response for successful deletion
};

/**
 * Update Reply - Edit existing reply content
 * Only reply author can edit their own replies
 */
const updateReply = async (req, res) => {
  const { id, commentId, replyId } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).send({ message: `Reply body can't be empty.` });
  }

  // Get post and authenticated user
  const post = await Post.findById(id);
  const user = await User.findById(req.user);

  if (!post) {
    return res.status(404).send({
      message: `Post with ID: ${id} does not exist in database.`,
    });
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  // Find target reply within comment
  const targetReply = targetComment.replies.find(
    (r) => r._id.toString() === replyId
  );

  if (!targetReply) {
    return res.status(404).send({
      message: `Reply comment with ID: '${replyId}'  does not exist in database.`,
    });
  }

  // Verify reply ownership (authorization)
  if (targetReply.repliedBy.toString() !== user._id.toString()) {
    return res.status(401).send({ message: 'Access is denied.' });
  }

  // Update reply content and modification timestamp
  targetReply.replyBody = reply;
  targetReply.updatedAt = Date.now();

  // Update arrays in post and save changes
  targetComment.replies = targetComment.replies.map((r) =>
    r._id.toString() !== replyId ? r : targetReply
  );

  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );

  await post.save();
  res.status(202).end(); // 202 Accepted for successful update
};

module.exports = { 
  postComment,
  deleteComment,
  updateComment, 
  postReply,
  deleteReply,
  updateReply,
};
