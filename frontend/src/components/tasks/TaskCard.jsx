import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreVertical, Tag, Users } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

function TaskCard({ task, onEdit, onDelete }) {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ✅ Check if user can edit/delete this task
  const userRole = currentUser?.role;
  const userId = currentUser?._id;
  const isAssigned = task.assignedTo?.some((a) => a._id === userId);

  const canEdit = userRole === 'owner' || userRole === 'admin' || isAssigned;
  const canDelete = userRole === 'owner' || userRole === 'admin';

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date() && task.status !== 'done';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 flex-1 pr-2">
          {task.title}
        </h3>

        {/* ✅ Three Dots Menu - FIXED */}
        {(canEdit || canDelete) && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
              {...{}} // ✅ Remove drag listeners from button
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showMenu && (
              <>
                {/* ✅ Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />

                {/* ✅ Menu */}
                <div className="absolute right-0 top-6 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(task);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      <div className="flex items-center space-x-2 mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
        {task.projectId && (
          <span className="text-xs text-gray-500">{task.projectId.key}</span>
        )}
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="inline-flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
            >
              <Tag className="w-3 h-3" />
              <span>{label}</span>
            </span>
          ))}
          {task.labels.length > 2 && (
            <span className="text-xs text-gray-500">
              +{task.labels.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Due Date */}
        {task.dueDate && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Assignees */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-gray-400" />
            <div className="flex -space-x-2">
              {task.assignedTo.slice(0, 3).map((assignee, index) => (
                <div
                  key={assignee._id}
                  className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                  title={`${assignee.firstName} ${assignee.lastName}`}
                  style={{ zIndex: task.assignedTo.length - index }}
                >
                  {assignee.firstName?.charAt(0)}
                  {assignee.lastName?.charAt(0)}
                </div>
              ))}
              {task.assignedTo.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold border-2 border-white">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Read-only indicator */}
      {!canEdit && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">Read-only</p>
        </div>
      )}
    </div>
  );
}

export default TaskCard;