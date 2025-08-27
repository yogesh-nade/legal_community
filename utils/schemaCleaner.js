// Schema Cleaner Utility - Standardizes JSON output from Mongoose schemas
// Transforms MongoDB documents to frontend-friendly JSON format


const schemaCleaner = (schema) => {
  // Configure automatic JSON transformation
  schema.set('toJSON', {
    transform: (_document, returnedObject) => {
      // Convert MongoDB _id to string id
      returnedObject.id = returnedObject._id.toString();
      
      // Remove MongoDB internal fields
      delete returnedObject._id;    // Original ObjectId
      delete returnedObject.__v;    // Version key
      
      // Remove sensitive data for security
      delete returnedObject.passwordHash;
    },
  });
};

module.exports = schemaCleaner;
