import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Edit2,
  Trash2,
  Reply,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../notifications/ToastContext";

function TaskComments({ taskId, projectId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const commentInputRef = useRef(null);

  const { user, token } = useSelector((state) => state.auth);
  const { socket } = useSocket();
  const toast = useToast();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/comments/task/${taskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setComments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [taskId, token, API_URL]);

  // 📡 Real-time comment listeners
  useEffect(() => {
    if (socket && projectId) {
      socket.on("comment-added", ({ taskId: commentTaskId, comment }) => {
        if (commentTaskId === taskId) {
          if (comment.parentId) {
            // Add reply to parent comment
            setComments((prev) =>
              prev.map((c) =>
                c._id === comment.parentId
                  ? { ...c, replies: [...(c.replies || []), comment] }
                  : c,
              ),
            );
          } else {
            // Add new top-level comment
            setComments((prev) => [comment, ...prev]);
          }
        }
      });

      socket.on("comment-updated", ({ taskId: commentTaskId, comment }) => {
        if (commentTaskId === taskId) {
          setComments((prev) =>
            prev.map((c) => {
              if (c._id === comment._id) return comment;
              if (c.replies) {
                return {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === comment._id ? comment : r,
                  ),
                };
              }
              return c;
            }),
          );
        }
      });

      socket.on("comment-deleted", ({ taskId: commentTaskId, commentId }) => {
        if (commentTaskId === taskId) {
          setComments((prev) =>
            prev
              .filter((c) => c._id !== commentId)
              .map((c) => ({
                ...c,
                replies: c.replies?.filter((r) => r._id !== commentId) || [],
              })),
          );
        }
      });

      socket.on("comment-reaction", ({ taskId: commentTaskId, comment }) => {
        if (commentTaskId === taskId) {
          setComments((prev) =>
            prev.map((c) => {
              if (c._id === comment._id) return comment;
              if (c.replies) {
                return {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === comment._id ? comment : r,
                  ),
                };
              }
              return c;
            }),
          );
        }
      });

      return () => {
        socket.off("comment-added");
        socket.off("comment-updated");
        socket.off("comment-deleted");
        socket.off("comment-reaction");
      };
    }
  }, [socket, taskId, projectId]);

  // Post comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `${API_URL}/api/comments/task/${taskId}`,
        {
          content: newComment,
          parentId: replyingTo,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNewComment("");
      setReplyingTo(null);
      toast.success("Comment posted", "Your comment has been added");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment", error.response?.data?.message);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId, content) => {
    try {
      await axios.put(
        `${API_URL}/api/comments/${commentId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Comment updated", "Your comment has been updated");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment", error.response?.data?.message);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Comment deleted", "Comment has been removed");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment", error.response?.data?.message);
    }
  };

  // Add reaction
  const handleReaction = async (commentId, emoji) => {
    try {
      await axios.post(
        `${API_URL}/api/comments/${commentId}/reaction`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowEmojiPicker(null);
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const quickEmojis = ["👍", "❤️", "🎉", "🚀", "👏", "🔥"];

  const CommentItem = ({ comment, isReply = false }) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showMenu, setShowMenu] = useState(false);

    const isOwner = comment.userId._id === user._id;
    const canDelete = isOwner || user.role === "owner" || user.role === "admin";

    return (
      <div className={`flex gap-3 ${isReply ? "ml-12 mt-3" : ""}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.userId.avatar ? (
            <img
              src={`${API_URL}${comment.userId.avatar}`}
              alt={`${comment.userId.firstName} ${comment.userId.lastName}`}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-semibold text-sm">
              {comment.userId.firstName.charAt(0)}
              {comment.userId.lastName.charAt(0)}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="glass-panel rounded-xl p-4 relative group">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-on-surface">
                  {comment.userId.firstName} {comment.userId.lastName}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-on-surface-variant italic">
                    (edited)
                  </span>
                )}
              </div>

              {/* Menu */}
              {(isOwner || canDelete) && (
                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-surface-container rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-1 w-32 glass-strong rounded-xl shadow-atmospheric py-1 z-20">
                        {isOwner && (
                          <button
                            onClick={() => {
                              setEditing(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              handleDeleteComment(comment._id);
                              setShowMenu(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full glass-panel rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                  rows="3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleUpdateComment(comment._id, editContent);
                      setEditing(false);
                    }}
                    className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dim transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1 glass-panel rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            {/* Reactions */}
            {comment.reactions && comment.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {Object.entries(
                  comment.reactions.reduce((acc, r) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  }, {}),
                ).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(comment._id, emoji)}
                    className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded-full text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>{emoji}</span>
                    <span className="font-semibold text-on-surface-variant">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <button
                onClick={() => setShowEmojiPicker(comment._id)}
                className="text-on-surface-variant hover:text-primary transition-colors font-semibold flex items-center gap-1"
              >
                <Smile className="w-4 h-4" />
                React
              </button>
              {!isReply && (
                <button
                  onClick={() => {
                    setReplyingTo(comment._id);
                    commentInputRef.current?.focus();
                  }}
                  className="text-on-surface-variant hover:text-primary transition-colors font-semibold flex items-center gap-1"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker === comment._id && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowEmojiPicker(null)}
                />
                <div className="absolute bottom-full left-0 mb-2 glass-strong rounded-xl shadow-atmospheric p-2 flex gap-2 z-20">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(comment._id, emoji)}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <form onSubmit={handlePostComment} className="flex gap-3">
        <div className="flex-shrink-0">
          {user?.avatar ? (
            <img
              src={`${API_URL}${user.avatar}`}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          {replyingTo && (
            <div className="mb-2 text-xs text-on-surface-variant flex items-center gap-2">
              <Reply className="w-3 h-3" />
              Replying to comment
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-primary hover:text-primary-dim font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="glass-panel rounded-xl p-3 flex gap-2 focus-within:ring-2 focus-within:ring-primary">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-transparent border-none outline-none text-sm resize-none"
              rows="2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handlePostComment(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="flex-shrink-0 p-2 bg-gradient-to-br from-primary to-secondary text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Press Cmd/Ctrl + Enter to send
          </p>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="spinner" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-on-surface-variant/50" />
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">
            No comments yet
          </p>
          <p className="text-xs text-on-surface-variant">
            Be the first to share your thoughts
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskComments;
