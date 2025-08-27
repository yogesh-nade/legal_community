

const pointsCalculator = (upvotes, downvotes, createdDate) => {
  const result = {};
  
  // Basic points calculation (upvotes - downvotes)
  // Minimum score is 0 (no negative scores displayed)
  const points = upvotes - downvotes;
  if (points <= 0) {
    result.pointsCount = 0;
  } else {
    result.pointsCount = points;
  }

  // Vote ratio calculation (upvotes / downvotes)
  // Used to identify quality content (higher ratio = better)
  const voteRatio = upvotes / downvotes;
  if (!isFinite(voteRatio)) {
    result.voteRatio = 1; // Default for posts with no downvotes
  } else {
    result.voteRatio = voteRatio;
  }

  

// hotScore = log(votes) + (currentTime - createdDate) / 3600
// But we don't have currentTime, so we use age-based approach:

  result.hotAlgo =
    Math.log(Math.max(Math.abs(upvotes - downvotes), 1)) - createdDate / 3600;
    // Note: MINUS sign creates time decay (older = lower score)

  // Controversial algorithm: High engagement with balanced votes
  // Formula: (total_votes) / max(|net_votes|, 1)
  // Higher values = more controversial (lots of both up/down votes)
  result.controversialAlgo =
    (upvotes + downvotes) / Math.max(Math.abs(upvotes - downvotes), 1);

  return result;
};

module.exports = pointsCalculator;
