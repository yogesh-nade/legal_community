

# � Server Architecture - 

## 📋 **Quick Overview**
Reddit-clone backend using **3-layer architecture**: Entry Point → App Layer → Data Layer

---

## 🏗️ **Architecture Pattern**

### **3-Layer Architecture**
```
index.js (Bootstrap) → app.js (Express Config) → db.js (Database)
```

**Interview Q: Why separate these layers?**
- **Testability**: Test app without starting server
- **Maintainability**: Modify one layer without affecting others  
- **Scalability**: Scale layers independently

---

## 📁 **File Analysis**

### **1. index.js - Server Bootstrap**
```javascript
connectToDB() → createServer(app) → listen(PORT)
```

**Interview Questions:**
- **Q: Why separate index.js from app.js?**
  - A: Testing flexibility, clean separation of server vs app logic
- **Q: What happens if database connection fails?**
  - A: Server starts but API calls will fail (graceful degradation)

### **2. db.js - Database Layer**
```javascript
// Modern Mongoose options
useNewUrlParser: true      // New URL parser
useUnifiedTopology: true   // New connection engine
useCreateIndex: true       // Avoid deprecation warnings
useFindAndModify: false    // Use modern methods
```

**Interview Questions:**
- **Q: Why use these Mongoose options?**
  - A: Performance, avoiding deprecation warnings, future compatibility
- **Q: How would you handle connection failures?**
  - A: Retry logic, health checks, fallback mechanisms

### **3. app.js - Express Configuration**

**Middleware Pipeline:**
```
CORS → JSON Parser → Static Files → Routes → Error Handler
```

**Interview Questions:**
- **Q: Explain middleware order importance**
  - A: CORS first (security), parsers before routes, error handlers last
- **Q: Why 10MB limit on body parser?**
  - A: Allow image uploads while preventing DoS attacks
- **Q: How does Express error handling work?**
  - A: 4-parameter middleware functions, error bubbling

### **4. config.js - Environment Management**

**Interview Questions:**
- **Q: Why use environment variables?**
  - A: Security (no secrets in code), different configs per environment
- **Q: How to handle missing environment variables?**
  - A: Default values, validation on startup, fail-fast approach

---





## �️ **Data Models (Database Schema Design)**

### **1. User Model - Authentication & Profile**
```javascript
// Key Fields
username: String (unique, 3-20 chars)
passwordHash: String (bcrypt hashed)
avatar: { exists, imageLink, imageId }
karmaPoints: { postKarma, commentKarma }
posts: [ObjectId] (ref: Post)
subscribedSubs: [ObjectId] (ref: Subreddit)
```

**Interview Questions:**
- **Q: Why store passwordHash instead of password?**
  - A: Security - never store plain text passwords, use bcrypt hashing
- **Q: Why separate postKarma and commentKarma?**
  - A: Different reputation sources, granular reputation tracking
- **Q: Explain the avatar object structure**
  - A: Track upload status, store image URL and ID for deletion

---

## 🌐 **API Endpoints Reference**

### **Authentication Endpoints**
Base URL: `/api`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/signup` | User registration | No |
| POST | `/api/login` | User authentication | No |

**Request Body Examples:**
```javascript
// Signup/Login
{
  "username": "string",
  "password": "string"
}
```

### **Post Management Endpoints**
Base URL: `/api/posts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | Get all posts with pagination & sorting | No |
| GET | `/api/posts/search` | Search posts by query | No |
| GET | `/api/posts/:id/comments` | Get post with comments | No |
| GET | `/api/posts/subscribed` | Get posts from subscribed subreddits | Yes |
| POST | `/api/posts` | Create new post | Yes |
| PATCH | `/api/posts/:id` | Update post (author only) | Yes |
| DELETE | `/api/posts/:id` | Delete post (author only) | Yes |

**Query Parameters:**
- `page`: Page number for pagination
- `limit`: Items per page
- `sortby`: new/top/hot/controversial/best/old
- `query`: Search term

### **Post Voting Endpoints**
Base URL: `/api/posts/:id`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/posts/:id/upvote` | Upvote post | Yes |
| POST | `/api/posts/:id/downvote` | Downvote post | Yes |

### **Comment Management Endpoints**
Base URL: `/api/posts/:id/comment`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/posts/:id/comment` | Add comment to post | Yes |
| PATCH | `/api/posts/:id/comment/:commentId` | Update comment (author only) | Yes |
| DELETE | `/api/posts/:id/comment/:commentId` | Delete comment (author only) | Yes |

### **Comment Voting Endpoints**
Base URL: `/api/posts/:id/comment/:commentId`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/posts/:id/comment/:commentId/upvote` | Upvote comment | Yes |
| POST | `/api/posts/:id/comment/:commentId/downvote` | Downvote comment | Yes |

### **Reply Management Endpoints**
Base URL: `/api/posts/:id/comment/:commentId/reply`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/posts/:id/comment/:commentId/reply` | Add reply to comment | Yes |
| PATCH | `/api/posts/:id/comment/:commentId/reply/:replyId` | Update reply (author only) | Yes |
| DELETE | `/api/posts/:id/comment/:commentId/reply/:replyId` | Delete reply (author only) | Yes |

### **Reply Voting Endpoints**
Base URL: `/api/posts/:id/comment/:commentId/reply/:replyId`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/posts/:id/comment/:commentId/reply/:replyId/upvote` | Upvote reply | Yes |
| POST | `/api/posts/:id/comment/:commentId/reply/:replyId/downvote` | Downvote reply | Yes |

### **Subreddit Management Endpoints**
Base URL: `/api/subreddits`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/subreddits` | Get all subreddits | No |
| GET | `/api/subreddits/r/:subredditName` | Get posts from specific subreddit | No |
| GET | `/api/subreddits/top10` | Get top 10 subreddits by subscribers | No |
| POST | `/api/subreddits` | Create new subreddit | Yes |
| PATCH | `/api/subreddits/:id` | Edit subreddit description (admin) | Yes |
| POST | `/api/subreddits/:id/subscribe` | Subscribe/unsubscribe to subreddit | Yes |

### **User Profile Endpoints**
Base URL: `/api/users`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:username` | Get user profile and posts | No |
| POST | `/api/users/avatar` | Upload/update user avatar | Yes |
| DELETE | `/api/users/avatar` | Remove user avatar | Yes |

### **Static File Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/uploads/avatars/:filename` | Get user avatar image | No |
| GET | `/uploads/posts/:filename` | Get post image | No |

### **Authentication Headers**
For protected endpoints, include JWT token in request headers:
```javascript
{
  "Authorization": "Bearer <your_jwt_token>"
}
```

### **Common Response Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### **2. Post Model - Content & Engagement**
```javascript
// Content Types (polymorphic design)
postType: String ('text', 'link', 'image')
textSubmission: String
linkSubmission: String  
imageSubmission: { imageLink, imageId }

// Voting System
upvotedBy: [ObjectId], downvotedBy: [ObjectId]
pointsCount: Number (calculated score)

// Reddit Algorithms
hotAlgo: Number (time + votes)
controversialAlgo: Number (balanced votes)
voteRatio: Number
```

**Interview Questions:**
- **Q: Why use polymorphic design for post types?**
  - A: Single collection for different content types, easier queries and management
- **Q: Explain the voting system design**
  - A: Store voter arrays to prevent double-voting, calculate net score
- **Q: What are hotAlgo and controversialAlgo for?**
  - A: Reddit-style content ranking algorithms for feed sorting

### **3. Comment/Reply System - Nested Threading**
```javascript
// Comment Schema (embedded in Post)
comments: [commentSchema]
  replies: [replySchema] // 2-level nesting

// Each has voting system
upvotedBy: [ObjectId], downvotedBy: [ObjectId]
pointsCount: Number
```

**Interview Questions:**
- **Q: Why embed comments instead of separate collection?**
  - A: Performance - fetch post with comments in single query, atomic updates
- **Q: Why limit to 2-level nesting?**
  - A: UI complexity, performance, most discussions don't go deeper
- **Q: How would you handle infinite comment threading?**
  - A: Separate comments collection with parentId reference

### **4. Subreddit Model - Community Management**
```javascript
subredditName: String (unique)
posts: [ObjectId] (ref: Post)
admin: ObjectId (ref: User)
subscribedBy: [ObjectId] (ref: User)
subscriberCount: Number (cached)
```

**Interview Questions:**
- **Q: Why cache subscriberCount?**
  - A: Performance - avoid counting array elements on every request
- **Q: How would you handle multiple moderators?**
  - A: Change admin to moderators array or separate Moderator model

---

## 🔗 **Database Relationships (Common Interview Topic)**

### **Relationship Types Used:**
```
User ←→ Post (One-to-Many)
User ←→ Subreddit (Many-to-Many via subscribedSubs)
Subreddit ←→ Post (One-to-Many)
Post → Comments → Replies (Embedded/Nested)
```

**Interview Questions:**
- **Q: When to use embedded vs referenced documents?**
  - A: Embedded for tightly coupled data (comments), referenced for independent entities
- **Q: How to handle Many-to-Many relationships in MongoDB?**
  - A: Array of ObjectId references or junction collection for complex cases
- **Q: Performance implications of different relationship patterns?**
  - A: Embedded = faster reads, Referenced = better for large/independent data

---

## 🛠️ **Routes & Controllers (API Layer)**

### **1. Authentication Routes (`/api`)**
```javascript
POST /api/signup   // User registration
POST /api/login    // User authentication
```

**Interview Questions:**
- **Q: Explain JWT authentication flow**
  - A: Login → Verify credentials → Generate JWT → Client stores token → Send token in headers
- **Q: Why hash passwords with bcrypt?**
  - A: Security - salt + hash prevents rainbow table attacks, slow hashing resists brute force
- **Q: How to handle password validation?**
  - A: Client-side for UX, server-side for security, use regex patterns and length requirements

### **2. User Routes (`/api/users`)**
```javascript
GET /api/users/:username     // Get user profile (PUBLIC)
POST /api/users/avatar       // Upload avatar (PROTECTED)
DELETE /api/users/avatar     // Remove avatar (PROTECTED)
```

**Interview Questions:**
- **Q: How to handle file uploads securely?**
  - A: Validate file types, limit file size, store outside web root, use unique filenames
- **Q: Why use base64 for image uploads?**
  - A: JSON compatibility, easy frontend handling, but inefficient for large files
- **Q: How to implement pagination?**
  - A: Query parameters (page, limit), calculate skip/limit, return previous/next info

### **3. Subreddit Routes (`/api/subreddits`)**
```javascript
GET /api/subreddits              // List all subreddits (PUBLIC)
GET /api/subreddits/r/:name      // Get subreddit posts with sorting (PUBLIC)
GET /api/subreddits/top10        // Top subreddits by popularity (PUBLIC)
POST /api/subreddits             // Create new subreddit (PROTECTED)
PATCH /api/subreddits/:id        // Edit description (ADMIN ONLY)
POST /api/subreddits/:id/subscribe // Toggle subscription (PROTECTED)
```

**Interview Questions:**
- **Q: Explain REST API design principles**
  - A: Use HTTP methods correctly, consistent URL patterns, proper status codes, stateless
- **Q: How to implement role-based access control?**
  - A: JWT payload with roles, middleware to check permissions, resource ownership validation
- **Q: Why use different sorting algorithms?**
  - A: User preference, content discovery, engagement optimization (hot vs new vs top)

---

## **8. COMPLETE CONTROLLER LAYER DOCUMENTATION**

### **Authentication Controllers (controllers/auth.js)**
**Purpose**: JWT-based user authentication with secure password handling
```javascript
// Key Functions:
- signup: bcrypt hashing + JWT token generation  
- login: Credential verification + token issuance
- Security: Password salting, input validation, error handling
```

### **User Management Controllers (controllers/user.js)**
**Purpose**: Profile operations with file upload capabilities
```javascript
// Key Features:
- getUserDetails: Profile + paginated posts/comments
- uploadAvatar: Base64 → filesystem conversion with cleanup
- deleteAvatar: File removal + database reference clearing
- Pagination: Consistent API responses with total counts
```

### **Subreddit Controllers (controllers/subreddit.js)**
**Purpose**: Community management with complex sorting algorithms
```javascript
// Sorting Algorithms:
- Hot: Recent posts with good engagement (time decay)
- Top: Highest rated posts (all-time/period-based)
- New: Chronological order (newest first)
- Controversial: High engagement with mixed votes
```

### **Post Management Controllers (controllers/post.js)**
**Purpose**: Main content CRUD with multiple post types
```javascript
// Post Types:
- Text posts: Title + body content
- Link posts: URL validation + metadata extraction
- Image posts: Base64 upload with file management
- Business Logic: Auto-upvote creation + karma tracking
```

### **Comment System Controllers (controllers/postComment.js)**
**Purpose**: 2-level nested comment threading system
```javascript
// Comment Architecture:
Post → Comments → Replies (max 2 levels)
- Auto-upvote: Authors automatically upvote their content
- Karma Updates: Real-time comment karma calculation
- Nested Operations: Complex array manipulation for replies
- CRUD Operations: Create, read, update, delete for comments and replies
```

### **Voting System Controllers (commentVote.js, postVote.js)**
**Purpose**: Reddit-style toggle voting with algorithm updates
```javascript
// Toggle Logic:
neutral → upvote → neutral
neutral → downvote → neutral  
upvote → downvote (switch)
downvote → upvote (switch)

// Algorithm Updates:
- Hot Algorithm: log(votes) + time_decay
- Controversial: total_votes / abs(net_votes)
- Karma System: Real-time author reputation updates
- Vote Arrays: Track individual user votes for toggle logic
```

### **Reddit Algorithm Implementation (utils/pointsCalculator.js)**
**Purpose**: Mathematical ranking algorithms for content sorting
```javascript
// Algorithm Components:
1. Hot Score: Combines popularity with recency
   Formula: log(max(|votes|, 1)) + timestamp/4500

2. Controversial Score: Measures debate intensity  
   Formula: (upvotes + downvotes) / max(|net_votes|, 1)

3. Vote Ratio: Quality indicator
   Formula: upvotes / downvotes (capped at 1.0)

4. Points Count: Basic score with minimum 0
   Formula: max(upvotes - downvotes, 0)
```

---

## 🔧 **Controller Logic Patterns**

### **Common Patterns Used:**

#### **1. Authentication & Authorization**
```javascript
// JWT middleware pattern
const auth = (req, res, next) => {
  const token = req.headers.authorization
  const decodedToken = jwt.verify(token, SECRET)
  req.user = decodedToken.id
  next()
}

// Admin permission check
if (subreddit.admin.toString() !== user._id.toString()) {
  return res.status(401).send({ message: 'Access denied' })
}
```

#### **2. Data Validation Pattern**
```javascript
// Input validation
if (!password || password.length < 6) {
  return res.status(400).send({ message: 'Invalid password' })
}

// Existence validation
if (!user) {
  return res.status(404).send({ message: 'User not found' })
}
```

#### **3. Pagination Pattern**
```javascript
// Calculate pagination
const paginated = paginateResults(page, limit, totalCount)
const results = await Model.find()
  .limit(limit)
  .skip(paginated.startIndex)
```

#### **4. File Management Pattern**
```javascript
// Clean up old files
if (existingFile) {
  fs.unlinkSync(oldFilePath)
}

// Save new file with unique name
const fileName = `file-${userId}-${Date.now()}.jpg`
fs.writeFileSync(newFilePath, buffer)
```

#### **5. Toggle/Subscribe Pattern**
```javascript
// Check if already exists
if (array.includes(item)) {
  // Remove (unsubscribe)
  array = array.filter(x => x !== item)
} else {
  // Add (subscribe)
  array = array.concat(item)
}
```

---

## 🛡️ **Security & Performance (Interview Favorites)**

### **Security Measures:**
- **JWT Authentication**: Secure token-based auth for protected routes
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Input Validation**: Server-side validation for all user inputs
- **Authorization Checks**: Role-based access control (admin permissions)
- **File Upload Security**: Type validation, size limits, unique filenames
- **CORS Protection**: Prevents unauthorized cross-origin requests
- **Environment Variables**: Sensitive data stored securely outside code

### **Performance Optimizations:**
- **Connection pooling**: MongoDB connection reuse
- **Middleware ordering**: Fast operations first
- **Static file serving**: Direct file serving without processing
- **Cached counts**: subscriberCount, commentCount for quick access
- **Embedded comments**: Single query for post + comments
- **Schema optimization**: Proper indexing on query fields
- **Pagination**: Limit data transfer with page/limit parameters
- **Selective queries**: Use .select() to fetch only needed fields

---

## 🎯 **Common Interview Questions & Answers**

### **API Design Questions:**
**Q: How do you design RESTful APIs?**
- Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Consistent URL patterns (/api/resource/:id)
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Stateless design with JWT tokens

**Q: How to implement authentication in Express?**
- JWT middleware to verify tokens
- Protected routes vs public routes
- Token validation and user extraction
- Proper error handling for invalid tokens

**Q: Explain file upload handling**
- Base64 encoding for JSON compatibility
- File validation (type, size limits)
- Unique filename generation (user-timestamp)
- Cleanup of old files when updating

**Q: How to implement pagination?**
- Query parameters: page, limit
- Calculate skip = (page - 1) * limit
- Return metadata: hasNext, hasPrevious, totalCount
- Database .limit() and .skip() methods

### **Database Design Questions:**
**Q: Embedded vs Referenced documents - when to use each?**
- **Embedded**: Small, tightly coupled data (comments in posts)
- **Referenced**: Large, independent data (users, subreddits)
- **Considerations**: Query patterns, document size limits, update frequency

**Q: How to design a voting system?**
- Store arrays of user IDs who voted
- Prevent duplicate votes with array checks
- Calculate net score (upvotes - downvotes)
- Consider vote weight for complex systems

---

## 📋 **COMPLETE DOCUMENTATION CHECKLIST**

### **✅ Files with Detailed Comments Added:**

#### **Core Architecture Files:**
- ✅ `index.js` - Server startup and lifecycle management
- ✅ `db.js` - MongoDB connection with error handling
- ✅ `app.js` - Express middleware pipeline configuration
- ✅ `utils/config.js` - Environment variables and configuration

#### **Data Models:**
- ✅ `models/user.js` - User schema with authentication and karma
- ✅ `models/post.js` - Post schema with embedded comments and voting
- ✅ `models/subreddit.js` - Subreddit schema with admin management

#### **Route Handlers:**
- ✅ `routes/auth.js` - Authentication endpoints (signup/login)
- ✅ `routes/user.js` - User profile and avatar management routes
- ✅ `routes/subreddit.js` - Community management with sorting options
- ✅ `routes/post.js` - Complex post, comment, and voting routes

#### **Business Logic Controllers:**
- ✅ `controllers/auth.js` - JWT authentication and bcrypt hashing
- ✅ `controllers/user.js` - Profile management with file uploads
- ✅ `controllers/subreddit.js` - Community operations and algorithms
- ✅ `controllers/postComment.js` - 2-level comment system with CRUD
- ✅ `controllers/commentVote.js` - Comment voting toggle system
- ✅ `controllers/postVote.js` - Post voting with Reddit algorithms

#### **Utility Functions:**
- ✅ `utils/paginateResults.js` - Pagination helper with metadata
- ✅ `utils/pointsCalculator.js` - Reddit ranking algorithm implementation

#### **Documentation:**
- ✅ `README2.md` - Complete interview-oriented guide

### **🎯 Key Concepts Documented:**
1. **Authentication Flow**: JWT middleware and bcrypt security
2. **File Upload System**: Base64 conversion and filesystem management
3. **Voting Algorithms**: Reddit-style ranking and controversy detection
4. **Comment Threading**: 2-level nested comment system
5. **Database Relationships**: Embedded vs referenced document patterns
6. **API Design Patterns**: RESTful endpoints with proper error handling
7. **Performance Optimization**: Pagination, caching, and query strategies
8. **Security Measures**: Input validation, authorization, and CORS protection



---

## 💡 **Design Patterns Used**

1. **Module Pattern**: Each file exports specific functionality
2. **Middleware Pattern**: Composable request processing
3. **Configuration Pattern**: Centralized settings
4. **Error Handling Pattern**: Graceful error recovery
5. **Embedded Document Pattern**: Comments within posts
6. **Reference Pattern**: User-Post-Subreddit relationships
7. **Polymorphic Pattern**: Different post types in single collection
8. **Schema Validation Pattern**: Mongoose schema constraints
9. **Repository Pattern**: Controllers handle business logic, models handle data
10. **Authentication Pattern**: JWT middleware for route protection
11. **Pagination Pattern**: Consistent page/limit query parameters
12. **Toggle Pattern**: Subscribe/unsubscribe logic in single endpoint

---



---

