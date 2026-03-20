import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { X, AlertCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

function ProjectModal({ isOpen, onClose, onSubmit, project }) {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    color: '#3B82F6',
    members: [], // ✅ Array of member objects with userId and role
  });

  const [errors, setErrors] = useState({});

  // ✅ Check permissions
  const canEdit = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        name: project.name || '',
        key: project.key || '',
        description: project.description || '',
        color: project.color || '#3B82F6',
        members: project.members?.map(m => ({
          userId: m.userId?._id || m.userId,
          role: m.role || 'member'
        })) || [],
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        key: '',
        description: '',
        color: '#3B82F6',
        members: [],
      });
    }
  }, [isOpen, project]);

  // ✅ Fetch team members
  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Handle adding/removing members
  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const exists = prev.members.find(m => m.userId === userId);
      if (exists) {
        return {
          ...prev,
          members: prev.members.filter(m => m.userId !== userId),
        };
      } else {
        return {
          ...prev,
          members: [...prev.members, { userId, role: 'member' }],
        };
      }
    });
  };

  // ✅ Handle changing member role
  const handleMemberRoleChange = (userId, role) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map(m =>
        m.userId === userId ? { ...m, role } : m
      ),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.key.trim()) {
      newErrors.key = 'Project key is required';
    } else if (formData.key.length > 10) {
      newErrors.key = 'Project key must be 10 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit && !project) {
      toast.error('Only Owners and Admins can create projects');
      return;
    }

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

  const colors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#EF4444', // Red
    '#6366F1', // Indigo
    '#14B8A6', // Teal
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ✅ Permission Warning */}
        {!canEdit && (
          <div className="mx-6 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Limited Access
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Only Owners and Admins can create or edit projects.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!canEdit}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !canEdit ? 'bg-gray-50 cursor-not-allowed' : ''
              } ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Website Redesign"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Project Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Key * (max 10 characters)
            </label>
            <input
              type="text"
              name="key"
              value={formData.key}
              onChange={handleChange}
              disabled={!canEdit || project} // ✅ Can't edit key after creation
              maxLength={10}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                !canEdit || project ? 'bg-gray-50 cursor-not-allowed' : ''
              } ${errors.key ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="WEB"
            />
            {errors.key && (
              <p className="text-red-500 text-sm mt-1">{errors.key}</p>
            )}
            {project && (
              <p className="text-xs text-gray-500 mt-1">
                Project key cannot be changed after creation
              </p>
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
              disabled={!canEdit}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !canEdit ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Project description..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Color
            </label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  disabled={!canEdit}
                  className={`w-10 h-10 rounded-lg border-2 transition ${
                    formData.color === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  } ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* ✅ Project Members */}
          {canEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Project Members
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No team members available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((member) => {
                      const isSelected = formData.members.some(
                        m => m.userId === member._id
                      );
                      const memberData = formData.members.find(
                        m => m.userId === member._id
                      );

                      return (
                        <div
                          key={member._id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleMemberToggle(member._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />

                          {/* Member Info */}
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

                          {/* Role Selection (if selected) */}
                          {isSelected && (
                            <select
                              value={memberData?.role || 'member'}
                              onChange={(e) =>
                                handleMemberRoleChange(member._id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.members.length} member(s)
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectModal;