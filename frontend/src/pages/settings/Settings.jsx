import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/layout/Layout";
import {
  Building2,
  Users,
  CreditCard,
  Bell,
  Shield,
  Trash2,
  Save,
  AlertTriangle,
  Lock,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import settingsService from "../../services/api/settingsService";

function Settings() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("organization");
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState(null);

  // Organization settings
  const [orgData, setOrgData] = useState({
    name: "",
    subdomain: "",
    description: "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskAssigned: true,
    taskCompleted: true,
    projectUpdates: true,
    teamInvites: true,
    weeklyDigest: false,
  });

  const [errors, setErrors] = useState({});

  // Role-based permissions
  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";
  const isMember = user?.role === "member";
  const isViewer = user?.role === "viewer";

  const canEditOrganization = isOwner;
  const canViewBilling = isOwner || isAdmin;
  const canUpgradePlan = isOwner;
  const canDeleteOrganization = isOwner;

  // Wrap fetch functions in useCallback to stabilize references
  const fetchOrganization = useCallback(async () => {
    try {
      const response = await settingsService.getOrganization();
      setOrganization(response.data);
      setOrgData({
        name: response.data.name || "",
        subdomain: response.data.subdomain || "",
        description: response.data.description || "",
      });
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  }, []);

  const fetchNotificationSettings = useCallback(async () => {
    try {
      const response = await settingsService.getNotificationSettings();
      if (response.data) {
        setNotificationSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrganization();
    fetchNotificationSettings();

    // Set default tab based on role
    if (isViewer || isMember) {
      setActiveTab("notifications"); // Members/Viewers see notifications first
    }
  }, [fetchOrganization, fetchNotificationSettings, isViewer, isMember]);

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const validateOrganization = () => {
    const newErrors = {};

    if (!orgData.name.trim()) {
      newErrors.name = "Organization name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateOrganization = async (e) => {
    e.preventDefault();

    if (!canEditOrganization) {
      toast.error("Only organization owners can update organization settings");
      return;
    }

    if (validateOrganization()) {
      setLoading(true);
      try {
        await settingsService.updateOrganization(orgData);
        toast.success("Organization settings updated!");
        fetchOrganization();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update organization",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateNotifications = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await settingsService.updateNotificationSettings(notificationSettings);
      toast.success("Notification preferences updated!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update notifications",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!canDeleteOrganization) {
      toast.error("Only organization owners can delete the organization");
      return;
    }

    const confirmText = window.prompt(
      'This action cannot be undone. Type "DELETE" to confirm:',
    );

    if (confirmText === "DELETE") {
      try {
        await settingsService.deleteOrganization();
        toast.success("Organization deleted");
        localStorage.clear();
        window.location.href = "/login";
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete organization",
        );
      }
    }
  };

  // Get role display info
  const getRoleInfo = () => {
    switch (user?.role) {
      case "owner":
        return {
          badge: "Owner",
          color: "bg-purple-100 text-purple-800",
          icon: Shield,
          description: "Full access to all settings",
        };
      case "admin":
        return {
          badge: "Admin",
          color: "bg-blue-100 text-blue-800",
          icon: Shield,
          description: "Can manage most settings except billing",
        };
      case "member":
        return {
          badge: "Member",
          color: "bg-green-100 text-green-800",
          icon: Users,
          description: "Can manage personal notification settings",
        };
      case "viewer":
        return {
          badge: "Viewer",
          color: "bg-gray-100 text-gray-800",
          icon: Eye,
          description: "Read-only access with notification settings",
        };
      default:
        return {
          badge: "User",
          color: "bg-gray-100 text-gray-800",
          icon: Users,
          description: "Standard user access",
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization and preferences
          </p>
        </div>

        {/* Role Badge */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${roleInfo.color}`}>
                <RoleIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${roleInfo.color}`}
                  >
                    {roleInfo.badge}
                  </span>
                  <span className="text-sm text-gray-600">
                    {roleInfo.description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Notice for Non-Owners */}
        {!isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Limited Access
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  {isAdmin
                    ? "As an Admin, you can view organization settings but cannot modify them. Contact the organization owner for changes."
                    : "You can only manage your personal notification settings. Contact an administrator for organization changes."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("organization")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === "organization"
                    ? "border-secondary text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Organization
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === "notifications"
                    ? "border-secondary text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Notifications
              </button>

              {/* Billing tab - Owner and Admin only */}
              {canViewBilling && (
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === "billing"
                      ? "border-secondary text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Billing
                  {!canUpgradePlan && (
                    <Eye className="w-3 h-3 inline ml-1 text-gray-400" />
                  )}
                </button>
              )}

              {/* Danger Zone - Owner only */}
              {isOwner && (
                <button
                  onClick={() => setActiveTab("danger")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === "danger"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Danger Zone
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Organization Tab */}
            {activeTab === "organization" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Organization Information
                  </h3>
                  {!canEditOrganization && (
                    <span className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>View Only</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleUpdateOrganization} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={orgData.name}
                      onChange={handleOrgChange}
                      disabled={!canEditOrganization}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-light ${
                        !canEditOrganization
                          ? "bg-gray-50 cursor-not-allowed"
                          : ""
                      } ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subdomain
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={orgData.subdomain}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <span className="text-gray-500">.tenantflow.com</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Subdomain cannot be changed after creation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={orgData.description}
                      onChange={handleOrgChange}
                      disabled={!canEditOrganization}
                      rows={4}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light ${
                        !canEditOrganization
                          ? "bg-gray-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Tell us about your organization..."
                    />
                  </div>

                  {/* Organization Stats */}
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {organization?.plan || "Free"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {organization?.memberCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {organization?.createdAt
                          ? new Date(
                              organization.createdAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          Organization Owner
                        </p>
                        <p className="text-sm text-purple-700 mt-1">
                          The owner has full control over organization settings,
                          billing, and can delete the organization.
                        </p>
                      </div>
                    </div>
                  </div>

                  {canEditOrganization && (
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Notifications Tab - Available to all roles */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Control how and when you receive notifications. These
                    settings apply only to your account.
                  </p>

                  <form
                    onSubmit={handleUpdateNotifications}
                    className="space-y-6"
                  >
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Notifications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive notifications via email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={notificationSettings.emailNotifications}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <hr className="border-gray-200" />

                      {/* Individual notification types */}
                      <div className="space-y-3 pl-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Task Assigned
                            </p>
                            <p className="text-xs text-gray-500">
                              When someone assigns you a task
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            name="taskAssigned"
                            checked={notificationSettings.taskAssigned}
                            onChange={handleNotificationChange}
                            disabled={!notificationSettings.emailNotifications}
                            className="w-4 h-4 text-white bg-gray-100 border-gray-300 rounded focus:ring-light disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Task Completed
                            </p>
                            <p className="text-xs text-gray-500">
                              When a task you created is completed
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            name="taskCompleted"
                            checked={notificationSettings.taskCompleted}
                            onChange={handleNotificationChange}
                            disabled={!notificationSettings.emailNotifications}
                            className="w-4 h-4 text-white bg-gray-100 border-gray-300 rounded focus:ring-light disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Project Updates
                            </p>
                            <p className="text-xs text-gray-500">
                              Important updates on your projects
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            name="projectUpdates"
                            checked={notificationSettings.projectUpdates}
                            onChange={handleNotificationChange}
                            disabled={!notificationSettings.emailNotifications}
                            className="w-4 h-4 text-white bg-gray-100 border-gray-300 rounded focus:ring-light disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Team Invites
                            </p>
                            <p className="text-xs text-gray-500">
                              When new members join your team
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            name="teamInvites"
                            checked={notificationSettings.teamInvites}
                            onChange={handleNotificationChange}
                            disabled={!notificationSettings.emailNotifications}
                            className="w-4 h-4 text-white bg-gray-100 border-gray-300 rounded focus:ring-light disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Weekly Digest
                            </p>
                            <p className="text-xs text-gray-500">
                              Weekly summary of your activity
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            name="weeklyDigest"
                            checked={notificationSettings.weeklyDigest}
                            onChange={handleNotificationChange}
                            disabled={!notificationSettings.emailNotifications}
                            className="w-4 h-4 text-white bg-gray-100 border-gray-300 rounded focus:ring-light disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {loading ? "Saving..." : "Save Preferences"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Billing Tab - Owner and Admin */}
            {activeTab === "billing" && canViewBilling && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Billing & Subscription
                  </h3>
                  {!canUpgradePlan && (
                    <span className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>View Only</span>
                    </span>
                  )}
                </div>

                {!canUpgradePlan && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">
                          Billing Access
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          You can view billing information but cannot make
                          changes. Contact the organization owner to upgrade or
                          modify the plan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Plan */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Plan</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize mt-1">
                        {organization?.plan || "Free"} Plan
                      </p>
                    </div>
                    {canUpgradePlan && (
                      <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition">
                        Upgrade Plan
                      </button>
                    )}
                  </div>
                </div>

                {/* Plan Features */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Free</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-4">
                      $0<span className="text-sm text-gray-600">/month</span>
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ Up to 5 team members</li>
                      <li>✓ 10 projects</li>
                      <li>✓ Basic features</li>
                      <li>✓ Email support</li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div className="border-2 border-primary rounded-lg p-6 relative">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      Popular
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Pro</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-4">
                      $19<span className="text-sm text-gray-600">/month</span>
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>✓ Up to 50 team members</li>
                      <li>✓ Unlimited projects</li>
                      <li>✓ Advanced features</li>
                      <li>✓ Priority support</li>
                    </ul>
                    {canUpgradePlan && (
                      <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition">
                        Upgrade to Pro
                      </button>
                    )}
                  </div>

                  {/* Enterprise Plan */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Enterprise
                    </h4>
                    <p className="text-3xl font-bold text-gray-900 mb-4">
                      Custom
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>✓ Unlimited members</li>
                      <li>✓ Unlimited projects</li>
                      <li>✓ Custom features</li>
                      <li>✓ Dedicated support</li>
                    </ul>
                    {canUpgradePlan && (
                      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        Contact Sales
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab - Owner only */}
            {activeTab === "danger" && isOwner && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-4">
                    Attention
                  </h3>

                  <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-start space-x-4">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-2">
                          Delete Organization
                        </h4>
                        <p className="text-sm text-red-700 mb-4">
                          Once you delete an organization, there is no going
                          back. All data, projects, tasks, and team members will
                          be permanently removed. Please be certain.
                        </p>
                        <ul className="text-sm text-red-700 mb-4 space-y-1">
                          <li>• All projects and tasks will be deleted</li>
                          <li>• All team members will lose access</li>
                          <li>• All data will be permanently removed</li>
                          <li>• This action cannot be undone</li>
                        </ul>
                        <button
                          onClick={handleDeleteOrganization}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Organization</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
