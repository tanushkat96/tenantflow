const express = require('express');
const router = express.Router();
const {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  addReaction,
  getCommentCount,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');


// All routes require authentication
router.use(protect);

// Comment routes
router.get('/task/:taskId', getTaskComments);
router.post('/task/:taskId', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.post('/:id/reaction', addReaction);
router.get('/task/:taskId/count', getCommentCount);

module.exports = router;