const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getNotificationSettings,
  updateNotificationSettings,
} = require('../controllers/settingsController');

router.get('/organization', protect, getOrganization);
router.put('/organization', protect, updateOrganization);
router.delete('/organization', protect, deleteOrganization);

router.get('/notifications', protect, getNotificationSettings);
router.put('/notifications', protect, updateNotificationSettings);

module.exports = router;