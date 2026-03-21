import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

function KanbanColumn({ id, title, tasks, onEdit, onDelete, onAddTask }) {
  const { setNodeRef } = useDroppable({ id });

  const columnColors = {
    todo: 'from-gray-500 to-gray-600',
    inprogress: 'from-blue-500 to-blue-600',
    review: 'from-purple-500 to-purple-600',
    done: 'from-green-500 to-green-600',
  };

  const bgColors = {
    todo: 'bg-gray-50',
    inprogress: 'bg-blue-50',
    review: 'bg-purple-50',
    done: 'bg-green-50',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`glass-light rounded-t-2xl p-4 border-b border-white/20`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${columnColors[id]} shadow-lg`} />
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="px-2.5 py-1 bg-white/50 rounded-full text-xs font-semibold text-gray-700">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={onAddTask}
            className="p-1.5 rounded-lg hover:bg-white/50 transition-all transform hover:scale-110 group"
          >
            <Plus className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 ${bgColors[id]}/30 backdrop-blur-sm rounded-b-2xl p-4 space-y-3 overflow-y-auto custom-scrollbar min-h-[400px]`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No tasks yet</p>
              <p className="text-xs text-gray-400 mt-1">Drag tasks here or click + to add</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default KanbanColumn;