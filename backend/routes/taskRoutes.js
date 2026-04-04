const express = require("express");
const router = express.Router();
const {
  canAssignTasks,
  canUpdateTask,
  validateAssignees,
} = require("../middleware/permissionMiddleware");
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  uploadTaskAttachments,
  deleteTaskAttachment,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

// All routes are protected
router.get("/", protect, getAllTasks);
router.get("/:id", protect, getTask);
router.post("/", protect, validateAssignees, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.patch("/:id/status", protect, updateTaskStatus);

// Attachment routes
router.post(
  "/:id/attachments",
  protect,
  upload.taskUpload.array("files", 5),
  uploadTaskAttachments
);
router.delete("/:id/attachments/:filename", protect, deleteTaskAttachment);

module.exports = router;

