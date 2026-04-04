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
import { Filter, Plus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function Tasks() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [filterProject, setFilterProject] = useState("");

  // ✅ Check permissions
  const canAssignTasks =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // must move 8px before drag starts — allows normal clicks
      },
    }),
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

  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectService.getAllProjects();
      dispatch(setProjects(response.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [dispatch]);

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
      setDefaultStatus(null);

      // ✅ Refresh to update project progress
      fetchTasks();

      // Return the created task so the modal can upload queued attachments
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
      throw error;
    }
  };

  const handleUpdateTask = async (taskData) => {
  try {
    const userId = currentUser?._id;
    const userRole = currentUser?.role;

    const isAssigned = selectedTask.assignedTo?.some((a) => {
      const assigneeId = typeof a === "string" ? a : a._id;
      return String(assigneeId) === String(userId);
    });

    // ✅ Also allow the task creator to update (matches backend logic)
    const createdById =
      typeof selectedTask.createdBy === "string"
        ? selectedTask.createdBy
        : selectedTask.createdBy?._id;
    const isCreator = String(createdById) === String(userId);

    if (userRole !== "owner" && userRole !== "admin" && !isAssigned && !isCreator) {
      toast.error("You can only update tasks assigned to or created by you");
      return;
    }

    const response = await taskService.updateTask(
      selectedTask._id,
      taskData
    );

    dispatch(updateTaskAction(response.data));
    toast.success("Task updated successfully!");
    setShowModal(false);
    setSelectedTask(null);

    fetchTasks();
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

        // ✅ Refresh to update project progress
        fetchTasks();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete task");
      }
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCreateInColumn = (status) => {
    setDefaultStatus(status);
    setShowModal(true);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find((t) => t._id === active.id);

    // Resolve target column — over.id may be a task._id (dropped over a card)
    // or a column id (dropped on empty column area)
    const validColumnIds = ["todo", "inprogress", "review", "done"];
    let targetColumnId = over.id;
    if (!validColumnIds.includes(targetColumnId)) {
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) {
        targetColumnId = overTask.status;
      } else {
        setActiveId(null);
        return;
      }
    }

    if (activeTask && activeTask.status !== targetColumnId) {
      try {
        await taskService.updateTaskStatus(activeTask._id, targetColumnId);
        dispatch(
          updateTaskStatus({
            taskId: activeTask._id,
            status: targetColumnId,
          }),
        );
        fetchTasks();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update task status",
        );
      }
    }

    setActiveId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    setDefaultStatus(null);
  };

  // ✅ Filter tasks by project
  const filteredTasks = filterProject
    ? tasks.filter((task) => task.projectId?._id === filterProject)
    : tasks;

  const getTasksByStatus = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const activeTask = tasks.find((t) => t._id === activeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {canAssignTasks
              ? "Manage and assign tasks across your team"
              : "Manage your assigned tasks"}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* ✅ Info Banner for Members */}
      {!canAssignTasks && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Assignment Restriction
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                As a {currentUser?.role}, you can create tasks but cannot assign
                them to team members. Only Owners and Admins can assign tasks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={getTasksByStatus(column.id)}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onAddTask={() => handleCreateInColumn(column.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}

export default Tasks;
