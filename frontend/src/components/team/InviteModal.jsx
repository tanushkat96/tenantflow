import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function InviteModal({ isOpen, onClose, onInvite, inviteLink }) {
  const [formData, setFormData] = useState({
    email: "",
    role: "member",
  });
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens - use key prop on modal component in parent
  // to force full remount and state reset, OR handle reset in onClose callback
  const handleClose = () => {
    // Reset form before closing
    setFormData({ email: "", role: "member" });
    setErrors({});
    setCopied(false);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onInvite(formData);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Invite Team Member
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="colleague@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">
                Admin - Full access except team settings
              </option>
              <option value="member">
                Member - Can create and manage tasks
              </option>
              <option value="viewer">Viewer - Read-only access</option>
            </select>
          </div>

        
{inviteLink && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <p className="text-sm font-medium text-green-900 mb-2">
      ✅ Invitation Email Sent Successfully!
    </p>
    <p className="text-sm text-green-700 mb-3">
      An invitation email has been sent to <strong>{formData.email}</strong> with instructions to join your team.
    </p>
    
    {/* Optional: Still show link for manual sharing */}
    <details className="mt-3">
      <summary className="text-sm text-green-800 cursor-pointer hover:text-green-900">
        Show invitation link (for manual sharing)
      </summary>
      <div className="mt-2 flex items-center space-x-2">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm"
        />
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-1"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copy</span>
            </>
          )}
        </button>
      </div>
    </details>
    
    <p className="text-xs text-green-600 mt-3">
      The recipient will receive an email with all necessary information to join.
    </p>
  </div>
)}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {inviteLink ? "Done" : "Cancel"}
            </button>
            {!inviteLink && (
              <button
                type="submit"
                className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-gray-300 transition"
              >
                Generate Invite Link
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteModal;
