import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Layout from "../../components/layout/Layout";
import KanbanColumn from "../../components/tasks/KanbanColumn";
import TaskCard from "../../components/tasks/TaskCard";
import TaskModal from "../../components/tasks/TaskModal";
import taskService from "../../services/api/taskService";
import projectService from "../../services/api/projectService";
import {
  setTasks,
  addTask,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  updateTaskStatus,
  setLoading,
} from "../../redux/slices/taskSlice";
import { setProjects } from "../../redux/slices/projectSlice";
import { Filter, Plus } from "lucide-react";
import toast from "react-hot-toast";

function Tasks() {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [filterProject, setFilterProject] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = [
    { id: "todo", title: "To Do" },
    { id: "inprogress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
  ];

  // Fetch projects on mount
  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectService.getAllProjects();
      dispatch(setProjects(response.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [dispatch]);

  // Fetch tasks on mount
  const fetchTasks = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await taskService.getAllTasks();
      dispatch(setTasks(response.data));
    } catch (error) {
      toast.error("Failed to load tasks");
      console.error("Error fetching tasks:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      dispatch(addTask(response.data));
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await taskService.updateTask(selectedTask._id, taskData);
      dispatch(updateTaskAction(response.data));
      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await taskService.deleteTask(task._id);
        dispatch(deleteTaskAction(task._id));
        toast.success("Task deleted successfully!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete task");
      }
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setDefaultStatus(null);
    setShowModal(true);
  };

  const handleAddTask = (status) => {
    setSelectedTask(null);
    setDefaultStatus(status);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTask(null);
    setDefaultStatus(null);
  };

  const handleModalSubmit = (taskData) => {
    if (selectedTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Check if dragging over a column
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      const task = tasks.find((t) => t._id === activeId);
      if (task && task.status !== overColumn.id) {
        // Update task status locally
        dispatch(updateTaskStatus({ taskId: activeId, status: overColumn.id }));
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the task
    const task = tasks.find((t) => t._id === activeId);
    if (!task) return;

    // Determine the new status
    let newStatus = task.status;

    // Check if dropped on a column
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      newStatus = overColumn.id;
    } else {
      // Dropped on another task - find that task's column
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Update on backend if status changed
    if (task.status !== newStatus) {
      try {
        await taskService.updateTaskStatus(activeId, newStatus);
        toast.success("Task status updated!");
      } catch {
        // Revert on error
        dispatch(updateTaskStatus({ taskId: activeId, status: task.status }));
        toast.error("Failed to update task status");
      }
    }
  };

  // Filter tasks by project
  const filteredTasks = filterProject
    ? tasks.filter((task) => {
        const projectId = task.projectId?._id || task.projectId;
        return projectId === filterProject;
      })
    : tasks;

  // Group tasks by status
  const getTasksByStatus = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  // Get active task for drag overlay
  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              Drag and drop tasks to update their status
            </p>
          </div>
          <button
            onClick={() => handleAddTask("todo")}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {filteredTasks.length} tasks
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  status={column}
                  tasks={getTasksByStatus(column.id)}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTask}
                  onAddTask={handleAddTask}
                />
              ))}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        task={selectedTask}
        defaultStatus={defaultStatus}
      />
    </Layout>
  );
}

export default Tasks;
