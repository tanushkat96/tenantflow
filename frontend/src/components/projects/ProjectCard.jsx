import {
  MoreVertical,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
} from "lucide-react";
import { useState } from "react";

function ProjectCard({ project, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Extract permissions from project data
  const canEdit = project.permissions?.canEdit || false;
  const canDelete = project.permissions?.canDelete || false;

  // ✅ Calculate progress
  const progress = project.progress?.progressPercentage || 0;
  const totalTasks = project.progress?.total || 0;
  const completedTasks = project.progress?.completed || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Color Bar */}
      <div
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: project.color }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {project.name}
              </h3>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {project.key}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          {/* ✅ Actions Menu (only if user has permissions) */}
          {(canEdit || canDelete) && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit(project);
                        }}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Project</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(project);
                        }}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ✅ Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: project.color,
              }}
            />
          </div>
        </div>

        {/* ✅ Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Total Tasks */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">{totalTasks}</p>
            <p className="text-xs text-gray-600">Total Tasks</p>
          </div>

          {/* Completed Tasks */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-500 mb-1">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">{completedTasks}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>

          {/* Members */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-purple-500 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {project.members?.length || 0}
            </p>
            <p className="text-xs text-gray-600">Members</p>
          </div>
        </div>

        {/* ✅ Task Breakdown */}
        {totalTasks > 0 && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                  <div
                    className="bg-gray-500 h-1 rounded-full"
                    style={{
                      width: `${(project.progress?.todo / totalTasks) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-gray-600">
                  {project.progress?.todo || 0} Todo
                </p>
              </div>

              <div className="text-center">
                <div className="w-full bg-blue-200 rounded-full h-1 mb-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{
                      width: `${(project.progress?.inProgress / totalTasks) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-gray-600">
                  {project.progress?.inProgress || 0} Active
                </p>
              </div>

              <div className="text-center">
                <div className="w-full bg-yellow-200 rounded-full h-1 mb-1">
                  <div
                    className="bg-yellow-500 h-1 rounded-full"
                    style={{
                      width: `${(project.progress?.review / totalTasks) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-gray-600">
                  {project.progress?.review || 0} Review
                </p>
              </div>

              <div className="text-center">
                <div className="w-full bg-green-200 rounded-full h-1 mb-1">
                  <div
                    className="bg-green-500 h-1 rounded-full"
                    style={{
                      width: `${(completedTasks / totalTasks) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-gray-600">{completedTasks} Done</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Project Members (Avatars) - FIXED */}
{project.members && project.members.length > 0 && (
  <div className="border-t border-gray-100 pt-4">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-gray-600">Team ({project.members.length})</p>
      <div className="flex -space-x-2">
        {project.members.slice(0, 5).map((member, index) => {
          // ✅ Handle both formats: member.userId or member directly
          const memberData = member.userId || member;
          const memberRole = member.role || 'member';
          
          return (
            <div
              key={memberData._id || index}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
              title={`${memberData.firstName} ${memberData.lastName} (${memberRole})`}
              style={{ zIndex: project.members.length - index }}
            >
              {memberData.firstName?.charAt(0)}
              {memberData.lastName?.charAt(0)}
            </div>
          );
        })}
        {project.members.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold border-2 border-white">
            +{project.members.length - 5}
          </div>
        )}
      </div>
    </div>
  </div>
)}
        {/* ✅ Read-only indicator */}
        {!canEdit && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Member - View Only</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;

