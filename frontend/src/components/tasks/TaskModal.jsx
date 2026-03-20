import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { X, Calendar, Tag, AlertCircle, Users } from "lucide-react";
import toast from "react-hot-toast";

function TaskModal({ isOpen, onClose, onSubmit, task, defaultStatus }) {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    projectId: "",
    assignedTo: [], // ✅ Array for multiple assignees
    labels: [],
  });

  const [errors, setErrors] = useState({});
  const [labelInput, setLabelInput] = useState("");

  // ✅ Check if current user can assign tasks
  const canAssign =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        projectId: task.projectId?._id || "",
        assignedTo: task.assignedTo?.map((a) => a._id) || [],
        labels: task.labels || [],
      });
    } else if (isOpen) {
      setFormData({
        title: "",
        description: "",
        status: defaultStatus || "todo",
        priority: "medium",
        dueDate: "",
        projectId: "",
        assignedTo: [],
        labels: [],
      });
    }
  }, [isOpen, task, defaultStatus]);

  // ✅ Fetch team members when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // ✅ Filter out owner (cannot assign to owner)
        const members = data.data.filter((u) => u.role !== "owner");
        setTeamMembers(members);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Handle multi-select for assignees
  const handleAssigneeChange = (userId) => {
    setFormData((prev) => {
      const newAssignedTo = prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId];
      return { ...prev, assignedTo: newAssignedTo };
    });
  };

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()],
      }));
      setLabelInput("");
    }
  };

  const handleRemoveLabel = (label) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((l) => l !== label),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    // ✅ Validate assignment permissions
    if (formData.assignedTo.length > 0 && !canAssign && !task) {
      newErrors.assignedTo = "Only Owners and Admins can assign tasks";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setLoading(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ✅ Permission Warning */}
        {!canAssign && !task && (
          <div className="mx-6 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Assignment Restriction
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  As a {currentUser?.role}, you can create tasks but cannot
                  assign them. Only Owners and Admins can assign tasks to team
                  members.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Task title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task description"
            />
          </div>

          {/* Project, Status, Priority */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority{" "}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColors[formData.priority]}`}
                >
                  {formData.priority}
                </span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ Assignees (Multi-Select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Assign To {!canAssign && "(Admin/Owner Only)"}
            </label>

            {canAssign ? (
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No team members available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <label
                        key={member._id}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedTo.includes(member._id)}
                          onChange={() => handleAssigneeChange(member._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {member.firstName?.charAt(0)}
                            {member.lastName?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  You don't have permission to assign tasks
                </p>
              </div>
            )}

            {/* ✅ Selected Assignees Display */}
            {formData.assignedTo.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.assignedTo.map((userId) => {
                  const member = teamMembers.find((m) => m._id === userId);
                  if (!member) return null;
                  return (
                    <div
                      key={userId}
                      className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>
                        {member.firstName} {member.lastName}
                      </span>
                      {canAssign && (
                        <button
                          type="button"
                          onClick={() => handleAssigneeChange(userId)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {errors.assignedTo && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
            )}
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Labels
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddLabel(e)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add label"
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Add
              </button>
            </div>
            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
