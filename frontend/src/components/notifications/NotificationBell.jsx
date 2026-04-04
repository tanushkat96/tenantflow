import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Bell, Check, X, Trash2 } from "lucide-react";
import { useSocket } from "../../context/SocketContext.js";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { socket } = useSocket();
  const { token } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token, API_URL]);

  // Listen for new notifications
  useEffect(() => {
    if (socket) {
      socket.on("new-notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        showToast(notification);
      });

      return () => {
        socket.off("new-notification");
      };
    }
  }, [socket]);

  // Show toast notification
  const showToast = (notification) => {
    // You can use react-hot-toast or a custom toast
    console.log("New notification:", notification);
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: "📋",
      task_completed: "✅",
      task_status_changed: "🔄",
      project_updated: "📁",
      team_invite: "👥",
    };
    return icons[type] || "🔔";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2.5 rounded-xl hover:bg-white/10 transition-all transform hover:scale-110 group"
      >
        <Bell className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 glass-strong rounded-2xl shadow-atmospheric-lg z-50 animate-scaleIn border border-outline-variant/20 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3
                  className="text-lg font-bold text-on-surface"
                  style={{ fontFamily: "Manrope" }}
                >
                  Notifications
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {unreadCount} unread
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-on-surface-variant/50" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-1">
                    No notifications
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-6 py-4 hover:bg-surface-container/30 transition-colors group ${
                        !notification.isRead ? "bg-primary-container/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                            {notification.message}
                          </p>
                          <p className="text-xs text-on-surface-variant/70 mt-2">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                              },
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-primary" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-t border-outline-variant/20">
                <button className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors w-full text-center">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
