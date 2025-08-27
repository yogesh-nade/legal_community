
const mongoose = require('mongoose');
const { MONGODB_URI: url } = require('./utils/config'); // Get MongoDB URI from config


const connectToDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,      // Use new URL parser (avoid deprecation warnings)
      useUnifiedTopology: true,   // Use new connection management engine
      useCreateIndex: true,       // Use createIndex instead of deprecated ensureIndex
      useFindAndModify: false,    // Use findOneAndUpdate instead of deprecated findAndModify
    });

    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error(`Error while connecting to MongoDB: `, error.message);
  }
};

module.exports = connectToDB;