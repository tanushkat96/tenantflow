const Comment = require("../models/Comment");
const Task = require("../models/Task");
const { emitToProject, emitToUser } = require("../config/socket");
const { createNotification } = require("../utils/notificationService");

// Get comments for a task
exports.getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const tenantId = req.user.tenantId;

    // Verify task exists and user has access
    const task = await Task.findOne({ _id: taskId, tenantId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comments = await Comment.find({ taskId, parentId: null })
      .populate("userId", "firstName lastName email avatar")
      .populate("mentions", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id })
          .populate("userId", "firstName lastName email avatar")
          .populate("mentions", "firstName lastName email")
          .sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies,
        };
      }),
    );

    res.json({
      success: true,
      data: commentsWithReplies,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

// Create comment
exports.createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions, parentId } = req.body;
    const userId = req.user._id;
    const tenantId = req.user.tenantId;

    // Verify task exists
    const task = await Task.findOne({ _id: taskId, tenantId }).populate(
      "projectId",
      "_id name",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create comment
    const comment = await Comment.create({
      taskId,
      projectId: task.projectId._id,
      tenantId,
      userId,
      content,
      mentions: mentions || [],
      parentId: parentId || null,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "firstName lastName email avatar")
      .populate("mentions", "firstName lastName email");

    // 📡 Emit real-time event
    emitToProject(task.projectId._id, "comment-added", {
      taskId,
      comment: populatedComment,
    });

    // Send notifications to mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        if (mentionedUserId.toString() !== userId.toString()) {
          await createNotification({
            tenantId,
            userId: mentionedUserId,
            type: "comment_mention",
            title: "You were mentioned",
            message: `${req.user.firstName} mentioned you in a comment on "${task.title}"`,
            relatedTo: "task",
            relatedId: taskId,
            actionBy: userId,
          });
        }
      }
    }

    // Notify task assignees (excluding commenter)
    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const assigneeId of task.assignedTo) {
        if (assigneeId.toString() !== userId.toString()) {
          await createNotification({
            tenantId,
            userId: assigneeId,
            type: "task_comment",
            title: "New comment on task",
            message: `${req.user.firstName} commented on "${task.title}"`,
            relatedTo: "task",
            relatedId: taskId,
            actionBy: userId,
          });
        }
      }
    }

    await logActivity({
      taskId:      taskId,
      projectId:   task.projectId._id,
      tenantId:    tenantId,
      userId:      userId,
      type:        'comment_added',
      description: `added a comment`,
      changes:     null,
    });
    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "firstName lastName email avatar",
    );

    // 📡 Emit real-time event
    const task = await Task.findById(comment.taskId).populate(
      "projectId",
      "_id",
    );
    if (task) {
      emitToProject(task.projectId._id, "comment-updated", {
        taskId: comment.taskId,
        comment: populatedComment,
      });
    }

    res.json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check permissions (owner of comment or admin/owner)
    const canDelete =
      comment.userId.toString() === userId.toString() ||
      userRole === "owner" ||
      userRole === "admin";

    if (!canDelete) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    const taskId = comment.taskId;
    const task = await Task.findById(taskId).populate("projectId", "_id");

    // Delete all replies first
    await Comment.deleteMany({ parentId: id });

    // Delete comment
    await Comment.findByIdAndDelete(id);

    // 📡 Emit real-time event
    if (task) {
      emitToProject(task.projectId._id, "comment-deleted", {
        taskId,
        commentId: id,
      });
    }

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

// Add reaction to comment
exports.addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user already reacted with this emoji
    const existingReaction = comment.reactions.find(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji,
    );

    if (existingReaction) {
      // Remove reaction
      comment.reactions = comment.reactions.filter(
        (r) =>
          !(r.userId.toString() === userId.toString() && r.emoji === emoji),
      );
    } else {
      // Add reaction
      comment.reactions.push({ userId, emoji });
    }

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "firstName lastName email avatar")
      .populate("reactions.userId", "firstName lastName");

    // 📡 Emit real-time event
    const task = await Task.findById(comment.taskId).populate(
      "projectId",
      "_id",
    );
    if (task) {
      emitToProject(task.projectId._id, "comment-reaction", {
        taskId: comment.taskId,
        comment: populatedComment,
      });
    }

    res.json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reaction",
      error: error.message,
    });
  }
};
// Get comment count for a task
exports.getCommentCount = async (req, res) => {
  try {
    const { taskId } = req.params;
    const tenantId = req.user.tenantId;

    const task = await Task.findOne({ _id: taskId, tenantId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const count = await Comment.countDocuments({ taskId, tenantId });

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get comment count",
      error: error.message,
    });
  }
};

module.exports = exports;
