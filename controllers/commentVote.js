

const Post = require('../models/post');
const User = require('../models/user');

/**
 * Upvote Comment - Add/toggle upvote for main comment
 * Toggle logic: neutral → upvote → neutral, downvote → upvote
 */
const upvoteComment = async (req, res) => {
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

  // Find target comment in post
  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  // Get comment author for karma updates
  const commentAuthor = await User.findById(targetComment.commentedBy);

  if (!commentAuthor) {
    return res
      .status(404)
      .send({ message: 'Comment author does not exist in database.' });
  }

  // Toggle upvote logic: Check if user already upvoted
  if (targetComment.upvotedBy.includes(user._id.toString())) {
    // Remove upvote (revert to neutral)
    targetComment.upvotedBy = targetComment.upvotedBy.filter(
      (u) => u.toString() !== user._id.toString()
    );

    // Decrease author's comment karma
    commentAuthor.karmaPoints.commentKarma--;
  } else {
    // Add upvote and remove any existing downvote
    targetComment.upvotedBy = targetComment.upvotedBy.concat(user._id);
    targetComment.downvotedBy = targetComment.downvotedBy.filter(
      (d) => d.toString() !== user._id.toString()
    );

    // Increase author's comment karma
    commentAuthor.karmaPoints.commentKarma++;
  }

  // Recalculate comment score (upvotes - downvotes)
  targetComment.pointsCount =
    targetComment.upvotedBy.length - targetComment.downvotedBy.length;

  
  // Update post comment array and save changes
  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );

  await post.save();
  await commentAuthor.save();

  res.status(201).end(); // Vote successfully processed
};

/**
 * Downvote Comment - Add/toggle downvote for main comment
 * Toggle logic: neutral → downvote → neutral, upvote → downvote
 */
const downvoteComment = async (req, res) => {
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

  // Find target comment in post
  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  // Get comment author for karma updates
  const commentAuthor = await User.findById(targetComment.commentedBy);

  if (!commentAuthor) {
    return res
      .status(404)
      .send({ message: 'Comment author does not exist in database.' });
  }

  // Toggle downvote logic: Check if user already downvoted
  if (targetComment.downvotedBy.includes(user._id.toString())) {
    // Remove downvote (revert to neutral)
    targetComment.downvotedBy = targetComment.downvotedBy.filter(
      (d) => d.toString() !== user._id.toString()
    );

    // Increase author's comment karma (removing negative impact)
    commentAuthor.karmaPoints.commentKarma++;
  } else {
    // Add downvote and remove any existing upvote
    targetComment.downvotedBy = targetComment.downvotedBy.concat(user._id);
    targetComment.upvotedBy = targetComment.upvotedBy.filter(
      (u) => u.toString() !== user._id.toString()
    );

    // Decrease author's comment karma
    commentAuthor.karmaPoints.commentKarma--;
  }

  // Recalculate comment score (upvotes - downvotes)
  targetComment.pointsCount =
    targetComment.upvotedBy.length - targetComment.downvotedBy.length;

  // Update post comment array and save changes
  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );

  await post.save();
  await commentAuthor.save();

  res.status(201).end(); // Vote successfully processed
};

/**
 * Upvote Reply - Add/toggle upvote for reply comment
 * Same toggle logic as comments but for nested replies
 */
const upvoteReply = async (req, res) => {
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

  const targetComment = post.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!targetComment) {
    return res.status(404).send({
      message: `Comment with ID: '${commentId}'  does not exist in database.`,
    });
  }

  const targetReply = targetComment.replies.find(
    (r) => r._id.toString() === replyId
  );

  if (!targetReply) {
    return res.status(404).send({
      message: `Reply comment with ID: '${replyId}'  does not exist in database.`,
    });
  }

  const replyAuthor = await User.findById(targetReply.repliedBy);

  if (!replyAuthor) {
    return res
      .status(404)
      .send({ message: 'Reply author does not exist in database.' });
  }

  if (targetReply.upvotedBy.includes(user._id.toString())) {
    targetReply.upvotedBy = targetReply.upvotedBy.filter(
      (u) => u.toString() !== user._id.toString()
    );

    replyAuthor.karmaPoints.commentKarma--;
  } else {
    targetReply.upvotedBy = targetReply.upvotedBy.concat(user._id);
    targetReply.downvotedBy = targetReply.downvotedBy.filter(
      (d) => d.toString() !== user._id.toString()
    );

    replyAuthor.karmaPoints.commentKarma++;
  }

  targetReply.pointsCount =
    targetReply.upvotedBy.length - targetReply.downvotedBy.length;

  targetComment.replies = targetComment.replies.map((r) =>
    r._id.toString() !== replyId ? r : targetReply
  );

  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );

  await post.save();
  await replyAuthor.save();

  res.status(201).end();
};
const downvoteReply = async (req, res) => {
  const { id, commentId, replyId } = req.params;

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

  const targetReply = targetComment.replies.find(
    (r) => r._id.toString() === replyId
  );

  if (!targetReply) {
    return res.status(404).send({
      message: `Reply comment with ID: '${replyId}'  does not exist in database.`,
    });
  }

  const replyAuthor = await User.findById(targetReply.repliedBy);

  if (!replyAuthor) {
    return res
      .status(404)
      .send({ message: 'Reply author does not exist in database.' });
  }

  if (targetReply.downvotedBy.includes(user._id.toString())) {
    targetReply.downvotedBy = targetReply.downvotedBy.filter(
      (d) => d.toString() !== user._id.toString()
    );

    replyAuthor.karmaPoints.commentKarma++;
  } else {
    targetReply.downvotedBy = targetReply.downvotedBy.concat(user._id);
    targetReply.upvotedBy = targetReply.upvotedBy.filter(
      (u) => u.toString() !== user._id.toString()
    );

    replyAuthor.karmaPoints.commentKarma--;
  }

  targetReply.pointsCount =
    targetReply.upvotedBy.length - targetReply.downvotedBy.length;

  targetComment.replies = targetComment.replies.map((r) =>
    r._id.toString() !== replyId ? r : targetReply
  );

  post.comments = post.comments.map((c) =>
    c._id.toString() !== commentId ? c : targetComment
  );

  await post.save();
  await replyAuthor.save();

  res.status(201).end();
}; 

module.exports = { upvoteComment, downvoteComment, upvoteReply, downvoteReply };
