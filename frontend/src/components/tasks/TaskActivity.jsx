import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Edit3,
  UserPlus,
  Tag,
  Calendar,
  Flag,
  ArrowRight,
  MessageSquare,
  Paperclip,
} from "lucide-react";

const activityIcons = {
  created: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  status_change: { icon: ArrowRight, color: "text-blue-500", bg: "bg-blue-50" },
  assigned: { icon: UserPlus, color: "text-purple-500", bg: "bg-purple-50" },
  priority_change: { icon: Flag, color: "text-orange-500", bg: "bg-orange-50" },
  due_date_set: { icon: Calendar, color: "text-pink-500", bg: "bg-pink-50" },
  comment_added: {
    icon: MessageSquare,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  updated: { icon: Edit3, color: "text-gray-500", bg: "bg-gray-100" },
  tag_added: { icon: Tag, color: "text-teal-500", bg: "bg-teal-50" },
  attachment: { icon: Paperclip, color: "text-indigo-500", bg: "bg-indigo-50" },
};

function TaskActivity({ taskId }) {
  const [activities, setActivities] = useState([]);

  const { token } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/tasks/${taskId}/activity`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setActivities(response.data.data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, [taskId, token, API_URL]);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-outline-variant/30" />

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = activityIcons[activity.type] || activityIcons.updated;
          const Icon = config.icon;

          return (
            <div key={activity._id || index} className="flex gap-4 relative">
              {/* Icon bubble */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${config.bg}`}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 glass-panel rounded-xl p-4 -mt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {/* Actor name */}
                    <span className="text-sm font-semibold text-on-surface">
                      {activity.userId?.firstName} {activity.userId?.lastName}
                    </span>{" "}
                    {/* Description */}
                    <span className="text-sm text-on-surface-variant">
                      {activity.description}
                    </span>
                    {/* Before → After change pill */}
                    {activity.changes && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {activity.changes.from && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full font-semibold">
                            {activity.changes.from}
                          </span>
                        )}
                        {activity.changes.from && activity.changes.to && (
                          <ArrowRight className="w-3 h-3 text-on-surface-variant" />
                        )}
                        {activity.changes.to && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full font-semibold">
                            {activity.changes.to}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-on-surface-variant whitespace-nowrap flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaskActivity;
