// User Routes - Handles user profile operations

const express = require('express');
const { auth } = require('../utils/middleware'); // JWT authentication middleware
const {
  getUser,
  setUserAvatar, 
  removeUserAvatar,
} = require('../controllers/user');

const router = express.Router();

router.get('/:username', getUser);

// POST /api/users/avatar - Upload/update user avatar (PROTECTED)
// Requires: JWT token in Authorization header
// Body: { avatarImage: base64_string }
router.post('/avatar', auth, setUserAvatar);

// DELETE /api/users/avatar - Remove user avatar (PROTECTED)
// Requires: JWT token in Authorization header
router.delete('/avatar', auth, removeUserAvatar);

module.exports = router;
