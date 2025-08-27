
const express = require('express');
require('express-async-errors');         // Automatically handles async errors without try-catch
const cors = require('cors');            // Cross-Origin Resource Sharing middleware
const path = require('path');
const middleware = require('./utils/middleware'); // Custom middleware functions

// Import route modules for different API endpoints
const authRoutes = require('./routes/auth');           // Authentication routes (login, register)
const postRoutes = require('./routes/post');           // Post-related routes (CRUD operations)
const subredditRoutes = require('./routes/subreddit'); // Subreddit/community management
const userRoutes = require('./routes/user');           // User profile management

const app = express();
app.use(cors());

// Parse incoming JSON requests with 10MB limit (for image uploads)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data with 10MB limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api', authRoutes);

app.use('/api/posts', postRoutes);

app.use('/api/subreddits', subredditRoutes);

app.use('/api/users', userRoutes);
 
// Handle requests to unknown endpoints (404 Not Found)
app.use(middleware.unknownEndpointHandler);

// Centralized error handling for all application errors
app.use(middleware.errorHandler);

module.exports = app;