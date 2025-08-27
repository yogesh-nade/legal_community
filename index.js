
const app = require('./app');           // Import the Express app configuration
const http = require('http');           // Node.js HTTP module for creating server
const { PORT } = require('./utils/config'); // Get PORT from environment configuration
const connectToDB = require('./db');    // Import database connection function

// Establish MongoDB connection before starting server
connectToDB();

// Create HTTP server using the configured Express app
const server = http.createServer(app);

// Start server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 