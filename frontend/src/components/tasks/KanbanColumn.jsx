import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { Plus } from "lucide-react";

function KanbanColumn({ id, tasks, onEdit, onDelete, onAddTask }) {
  const { setNodeRef } = useDroppable({ id });

  const statusConfig = {
    todo: {
      title: "To Do",
      color: "bg-gray-100",
      textColor: "text-gray-700",
    },
    inprogress: {
      title: "In Progress",
      color: "bg-blue-100",
      textColor: "text-blue-700",
    },
    review: {
      title: "Review",
      color: "bg-purple-100",
      textColor: "text-purple-700",
    },
    done: {
      title: "Done",
      color: "bg-green-100",
      textColor: "text-green-700",
    },
  };

  const config = statusConfig[id] || statusConfig.todo;

  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className={`${config.color} rounded-lg p-3  mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <h3 className={`font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <span className={`text-sm ${config.textColor} opacity-75`}>
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => onAddTask(id)}
            className={`p-1 rounded hover:bg-white/50 transition ${config.textColor}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[500px] bg-gray-50 rounded-lg p-3"
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
