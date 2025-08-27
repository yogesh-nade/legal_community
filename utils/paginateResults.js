
/**
 * Calculate pagination parameters and navigation metadata
 * 
 * @param {number} page - Current page number (1-based indexing)
 * @param {number} limit - Number of items per page
 * @param {number} docCount - Total number of documents in collection
 * @returns {object} Pagination object with startIndex, endIndex, and navigation
 * 
 * Example Usage:
 * const paginated = paginateResults(2, 10, 25)
 * // Returns: { startIndex: 10, endIndex: 20, results: { previous: {...}, next: {...} } }
 */
const paginateResults = (page, limit, docCount) => {
  // Calculate starting index for database skip operation
  // Example: page=2, limit=10 → startIndex=10 (skip first 10 items)
  const startIndex = (page - 1) * limit;
  
  // Calculate ending index for determining if more pages exist
  // Example: page=2, limit=10 → endIndex=20
  const endIndex = page * limit;
  
  // Initialize results object to store navigation metadata
  const results = {};

  // Check if there are more items after current page (next page exists)
  // If endIndex (20) < docCount (25), then there are 5 more items → next page available
  if (endIndex < docCount) {
    results.next = {
      page: page + 1,    // Next page number
      limit,             // Same limit for consistency
    };
  }

  // Check if there are items before current page (previous page exists)
  // If startIndex > 0, means we're not on first page → previous page available
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,    // Previous page number
      limit,             // Same limit for consistency
    };
  }

  // Return pagination metadata for use in database queries and API responses
  return {
    startIndex,    // Use with .skip() in MongoDB queries
    endIndex,      // For reference (not used in queries)
    results,       // Navigation links for API response
  };
};

module.exports = paginateResults;
