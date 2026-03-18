import { MoreVertical, Users, CheckCircle } from "lucide-react";
import { useState } from "react";

function ProjectCard({ project, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  // Get progress data from the API response
  const progress = project.progress || {};
  const totalTasks = progress.total || 0;
  const completedTasks = progress.completed || 0;
  const progressPercentage = progress.progressPercentage || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow p-6 relative">
      {/* Project Color Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: project.color || "#3B82F6" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500 uppercase font-medium">
            {project.key}
          </p>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(project);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(project);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Tasks */}
          <div className="flex items-center space-x-1 text-sm">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {completedTasks}/{totalTasks}
            </span>
          </div>

          {/* Members */}
          <div className="flex items-center space-x-1 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {project.members?.length || 0}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            project.status === "active"
              ? "bg-green-100 text-green-800"
              : project.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: project.color || "#3B82F6",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
