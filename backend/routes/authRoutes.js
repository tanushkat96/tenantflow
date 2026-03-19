const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updateProfile, changePassword,uploadAvatar, removeAvatar, getOrganization } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);  
router.put('/change-password', protect, changePassword);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, removeAvatar);  // ←
router.get('/organization', protect, getOrganization); 
module.exports = router;