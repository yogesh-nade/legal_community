
const Subreddit = require('../models/subreddit');
const User = require('../models/user');
const Post = require('../models/post');

const paginateResults = require('../utils/paginateResults'); // Pagination utility

/**
 * Get All Subreddits - Retrieve list of all communities
 * Public endpoint for browsing available subreddits
 */
const getSubreddits = async (_req, res) => {
  // Fetch only essential fields for performance
  const allSubreddits = await Subreddit.find({}).select('id subredditName');
  res.status(200).json(allSubreddits);
};

/**
 * Get Subreddit Posts - Retrieve posts from specific community
 * Supports sorting and pagination for content discovery
 */
const getSubredditPosts = async (req, res) => {
  const { subredditName } = req.params;
  const page = Number(req.query.page);   // Pagination: current page
  const limit = Number(req.query.limit); // Pagination: posts per page
  const sortBy = req.query.sortby;        // Sorting: new/top/hot/controversial/best/old

  // Define sorting algorithms based on Reddit-style metrics
  let sortQuery;
  switch (sortBy) {
    case 'new':
      sortQuery = { createdAt: -1 };        // Newest first
      break;
    case 'top':
      sortQuery = { pointsCount: -1 };      // Highest score first
      break;
    case 'best':
      sortQuery = { voteRatio: -1 };        // Best vote ratio
      break;
    case 'hot':
      sortQuery = { hotAlgo: -1 };          // Hot algorithm (time + votes)
      break;
    case 'controversial':
      sortQuery = { controversialAlgo: -1 }; // Controversial algorithm
      break;
    case 'old':
      sortQuery = { createdAt: 1 };         // Oldest first
      break;
    default:
      sortQuery = {};                       // Default sorting
  }

  // Find subreddit by name (case-insensitive) and populate admin info
  const subreddit = await Subreddit.findOne({
    subredditName: { $regex: new RegExp('^' + subredditName + '$', 'i') },
  }).populate('admin', 'username');

  if (!subreddit) {
    return res.status(404).send({
      message: `Subreddit '${subredditName}' does not exist on server.`,
    });
  }

  // Get total post count for pagination
  const postsCount = await Post.find({
    subreddit: subreddit.id,
  }).countDocuments();

  // Calculate pagination parameters
  const paginated = paginateResults(page, limit, postsCount);
  
  // Fetch posts with sorting, pagination, and population
  const subredditPosts = await Post.find({ subreddit: subreddit.id })
    .sort(sortQuery)               // Apply sorting algorithm
    .select('-comments')           // Exclude comments for performance
    .limit(limit)
    .skip(paginated.startIndex)
    .populate('author', 'username')      // Get author username
    .populate('subreddit', 'subredditName'); // Get subreddit name

  // Structure paginated response
  const paginatedPosts = {
    previous: paginated.results.previous,
    results: subredditPosts,
    next: paginated.results.next,
  };

  res.status(200).json({ subDetails: subreddit, posts: paginatedPosts });
};

/**
 * Get Top Subreddits - Retrieve most popular communities
 * Used for discovery and trending sections
 */
const getTopSubreddits = async (_req, res) => {
  // Get top 10 subreddits by subscriber count
  const top10Subreddits = await Subreddit.find({})
    .sort({ subscriberCount: -1 })    // Sort by subscriber count descending
    .limit(10)
    .select('-description -posts -admin '); // Exclude heavy fields

  res.status(200).json(top10Subreddits);
};

/**
 * Create New Subreddit - Establish new community
 * Authenticated endpoint for community creation
 */
const createNewSubreddit = async (req, res) => {
  const { subredditName, description } = req.body;

  // Get authenticated user as admin
  const admin = await User.findById(req.user);
  if (!admin) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  // Check if subreddit name already exists (case-insensitive)
  const existingSubName = await Subreddit.findOne({
    subredditName: { $regex: new RegExp('^' + subredditName + '$', 'i') },
  });

  if (existingSubName) {
    return res.status(403).send({
      message: `Subreddit having same name "${subredditName}" already exists. Choose another name.`,
    });
  }

  // Create new subreddit with admin as first subscriber
  const newSubreddit = new Subreddit({
    subredditName,
    description,
    admin: admin._id,                 // Set creator as admin
    subscribedBy: [admin._id],        // Admin is automatically subscribed
    subscriberCount: 1,               // Start with 1 subscriber (admin)
  });

  const savedSubreddit = await newSubreddit.save();

  // Add subreddit to admin's subscribed list
  admin.subscribedSubs = admin.subscribedSubs.concat(savedSubreddit._id);
  await admin.save();

  return res.status(201).json(savedSubreddit);
};

/**
 * Edit Subreddit Description - Update community description
 * Admin-only endpoint for community management
 */
const editSubDescription = async (req, res) => {
  const { description } = req.body;
  const { id } = req.params;

  if (!description) {
    return res
      .status(400)
      .send({ message: `Description body can't be empty.` });
  }

  // Get authenticated user and target subreddit
  const admin = await User.findById(req.user);
  const subreddit = await Subreddit.findById(id);

  if (!admin) {
    return res
      .status(404)
      .send({ message: 'User does not exist in database.' });
  }

  if (!subreddit) {
    return res.status(404).send({
      message: `Subreddit with ID: ${id} does not exist in database.`,
    });
  }

  // Verify admin permissions
  if (subreddit.admin.toString() !== admin._id.toString()) {
    return res.status(401).send({ message: 'Access is denied.' });
  }

  // Update description
  subreddit.description = description;

  await subreddit.save();
  res.status(202).end(); // Accepted response
};

/**
 * Subscribe to Subreddit - Toggle user subscription
 * Handles both subscribe and unsubscribe operations
 */
const subscribeToSubreddit = async (req, res) => {
  const { id } = req.params;

  // Get subreddit and authenticated user
  const subreddit = await Subreddit.findById(id);
  const user = await User.findById(req.user);

  // Check if user is already subscribed
  if (subreddit.subscribedBy.includes(user._id.toString())) {
    // UNSUBSCRIBE: Remove user from subreddit's subscriber list
    subreddit.subscribedBy = subreddit.subscribedBy.filter(
      (s) => s.toString() !== user._id.toString()
    );

    // Remove subreddit from user's subscribed list
    user.subscribedSubs = user.subscribedSubs.filter(
      (s) => s.toString() !== subreddit._id.toString()
    );
  } else {
    // SUBSCRIBE: Add user to subreddit's subscriber list
    subreddit.subscribedBy = subreddit.subscribedBy.concat(user._id);

    // Add subreddit to user's subscribed list
    user.subscribedSubs = user.subscribedSubs.concat(subreddit._id);
  }

  // Update cached subscriber count for performance
  subreddit.subscriberCount = subreddit.subscribedBy.length;

  // Save both documents
  await subreddit.save();
  await user.save();

  res.status(201).end(); // Created response
};

module.exports = {
  getSubreddits,
  getSubredditPosts,
  getTopSubreddits,
  createNewSubreddit,
  editSubDescription,
  subscribeToSubreddit,
};
