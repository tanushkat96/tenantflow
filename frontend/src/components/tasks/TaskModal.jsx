import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { X, Calendar, Tag, AlertCircle, Users, Paperclip, Upload, Trash2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import taskService from "../../services/api/taskService";

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
    assignedTo: [],
    labels: [],
  });

  const [errors, setErrors] = useState({});
  const [labelInput, setLabelInput] = useState("");

  // ── Attachment state ──────────────────────────────────────────────────────
  const [attachments, setAttachments] = useState([]);
  const [queuedFiles, setQueuedFiles] = useState([]); // files staged for upload on create
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
      setAttachments(task.attachments || []);
      setQueuedFiles([]);       // clear any queued files when switching tasks
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
      setAttachments([]);
      setQueuedFiles([]);
    }
  }, [isOpen, task, defaultStatus]);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        let members = data.data.filter((u) => u.role !== "owner");
        if (canAssign && !members.some((m) => m._id === currentUser?._id)) {
          members = [currentUser, ...members];
        }
        setTeamMembers(members);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }, [canAssign, currentUser]);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen, fetchTeamMembers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

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

  // ── Attachment handlers ───────────────────────────────────────────────────
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateFiles = (files) => {
    const valid = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only images (jpg, png, gif, webp) allowed`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: exceeds 5 MB limit`);
        continue;
      }
      valid.push(file);
    }
    return valid;
  };

  const handleFilesSelected = async (rawFiles) => {
    const files = validateFiles(Array.from(rawFiles));
    if (files.length === 0) return;

    if (task) {
      // Edit mode — upload immediately
      setUploadingFiles(true);
      try {
        const result = await taskService.uploadAttachments(task._id, files);
        setAttachments(result.data.attachments || []);
        toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
      } catch (err) {
        toast.error("Upload failed. Please try again.");
        console.error(err);
      } finally {
        setUploadingFiles(false);
      }
    } else {
      // Create mode — queue files; they'll be uploaded after task is created
      setQueuedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleDeleteAttachment = async (filename) => {
    try {
      const result = await taskService.deleteAttachment(task._id, filename);
      setAttachments(result.data.attachments || []);
      toast.success("Attachment removed");
    } catch (err) {
      toast.error("Failed to remove attachment");
      console.error(err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  // ── Validation & submit ───────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!task && formData.assignedTo.length > 0 && !canAssign) {
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
        let submitData = { ...formData };
        if (task && !canAssign) {
          delete submitData.assignedTo;
        }
        const result = await onSubmit(submitData);

        // If creating a new task and there are queued files, upload them now
        if (!task && queuedFiles.length > 0 && result?._id) {
          setUploadingFiles(true);
          try {
            await taskService.uploadAttachments(result._id, queuedFiles);
          } catch (uploadErr) {
            toast.error("Task created but attachments failed to upload.");
            console.error(uploadErr);
          } finally {
            setUploadingFiles(false);
          }
        }

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

        {/* Permission Warning */}
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

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Assign To {!canAssign && "(View Only)"}
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
            ) : task && formData.assignedTo.length > 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {formData.assignedTo.map((uid) => {
                    const member =
                      teamMembers.find((m) => m._id === uid) ||
                      task.assignedTo?.find((a) => (a._id || a) === uid);
                    if (!member) return null;
                    return (
                      <div
                        key={uid}
                        className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only Owners and Admins can change assignees.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  {task
                    ? "No assignees"
                    : "Only Owners and Admins can assign tasks"}
                </p>
              </div>
            )}

            {/* Selected Assignees Display (admin only) */}
            {canAssign && formData.assignedTo.length > 0 && (
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
                      <button
                        type="button"
                        onClick={() => handleAssigneeChange(userId)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
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

          {/* ── Attachments ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Paperclip className="w-4 h-4 inline mr-1" />
              Attachments
              {(attachments.length > 0 || queuedFiles.length > 0) && (
                <span className="ml-2 text-xs text-gray-400">
                  {task
                    ? `(${attachments.length}/10)`
                    : queuedFiles.length > 0
                    ? `(${queuedFiles.length} queued — uploaded after save)`
                    : ""}
                </span>
              )}
            </label>

              {/* Queued files preview (create mode) */}
              {!task && queuedFiles.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {queuedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative group flex items-center space-x-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-1.5 rounded-lg"
                      >
                        <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="max-w-[100px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setQueuedFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="ml-1 hover:text-red-500 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing thumbnails (edit mode) */}
              {task && attachments.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {attachments.map((att) => (
                    <div
                      key={att.filename}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square"
                    >
                      <img
                        src={att.url}
                        alt={att.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      {/* Fallback icon */}
                      <div
                        className="hidden w-full h-full items-center justify-center"
                        style={{ display: "none" }}
                      >
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.filename)}
                          className="p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition"
                          title="Remove attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Filename tooltip */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-all">
                        {att.originalName}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dropzone — show in both create and edit modes */}
              {(task ? attachments.length < 10 : true) && (
                <div
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                  {uploadingFiles ? (
                    <div className="flex flex-col items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      <span className="text-sm font-medium">Uploading…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-500">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        Drop images here or{" "}
                        <span className="text-blue-600 underline">browse</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, GIF, WEBP · Max 5 MB each · Up to 5 at a time
                      </p>
                    </div>
                  )}
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
