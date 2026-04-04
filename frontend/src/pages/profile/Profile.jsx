import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../../components/layout/Layout";
import {
  User,
  Mail,
  Lock,
  Save,
  Camera,
  Building2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../services/api/axios";
import authService from "../../services/api/authService";
import { loginSuccess } from "../../redux/slices/authSlice";

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [organization, setOrganization] = useState(null);

  // Personal Info
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setPersonalData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      fetchOrganization();
    }
  }, [user]);

  const fetchOrganization = async () => {
    try {
      const response = await authService.getOrganization();
      setOrganization(response.data);
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!personalData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!personalData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault();

    if (validatePersonalInfo()) {
      setLoading(true);
      try {
        const response = await authService.updateProfile(personalData);

        // Update Redux state with new user data
        dispatch(
          loginSuccess({
            user: response.data,
            token: localStorage.getItem("token"),
          }),
        );

        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update profile",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (validatePassword()) {
      setLoading(true);
      try {
        await authService.changePassword(passwordData);

        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        toast.success("Password updated successfully!");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update password",
        );
      } finally {
        setLoading(false);
      }
    }
  };
  // ✅ PROFILE PICTURE UPLOAD
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("avatar", file);

      // Upload image
      const response = await authService.uploadAvatar(formData);

      // Update Redux state with new avatar URL
      dispatch(
        loginSuccess({
          user: { ...user, avatar: response.data.avatar },
          token: localStorage.getItem("token"),
        }),
      );

      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!window.confirm("Remove profile picture?")) return;

    try {
      await authService.removeAvatar();

      // Update Redux state to remove avatar
      dispatch(
        loginSuccess({
          user: { ...user, avatar: null },
          token: localStorage.getItem("token"),
        }),
      );

      toast.success("Profile picture removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove picture");
    }
  };

  return (
   <div className="space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and security
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar with Upload */}
              <div className="relative group">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Avatar Display */}
                {user?.avatar ? (
                  <img
                    src={`${API_BASE_URL}${user.avatar}`}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-light"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* Fallback initials (always rendered, hidden when image exists) */}
                <div
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold  object-cover border-10 border-black"
                  style={{ display: user?.avatar ? "none" : "flex" }}
                >
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>

                {/* Upload Overlay */}
                <div
                  onClick={handleImageClick}
                  className="absolute inset-0 bg-black/50 rounded-full   object-cover border-10 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingImage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Camera Button */}
                <button
                  onClick={handleImageClick}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full border-2 border-gray-200 hover:border-accent transition shadow-sm disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 flex items-center space-x-2 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </p>

                {/* Organization Info */}
                {organization && (
                  <div className="flex items-center space-x-2 mt-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">{organization.name}</span>
                    <span className="text-xs text-gray-400">
                      ({organization.subdomain})
                    </span>
                  </div>
                )}

                <span className="inline-block mt-2 px-3 py-1 bg-light text-purple-800 text-sm rounded-full font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Remove Picture Button */}
            {user?.avatar && (
              <button
                onClick={removeProfilePicture}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove Picture
              </button>
            )}
          </div>

          
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("personal")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === "personal"
                    ? "border-primary text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === "security"
                    ? "border-primary text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Security
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <form onSubmit={handleUpdatePersonalInfo} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={personalData.firstName}
                      onChange={handlePersonalChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={personalData.lastName}
                      onChange={handlePersonalChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={personalData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                {/* Organization Display (Read-only) */}
                {organization && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <div className="flex items-center space-x-3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {organization.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Subdomain: {organization.subdomain}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                      errors.currentPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Include at least one number</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? "Updating..." : "Update Password"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
