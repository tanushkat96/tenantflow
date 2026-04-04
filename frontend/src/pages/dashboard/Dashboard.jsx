import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../../components/dashboard/StatsCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import statsService from "../../services/api/statsService";
import { FolderKanban, CheckSquare, Users, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await statsService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Projects"
            value={stats?.overview?.totalProjects || 0}
            icon={FolderKanban}
            trend="up"
            trendValue="+2"
            color="secondary"
          />
          <StatsCard
            title="Total Tasks"
            value={stats?.overview?.totalTasks || 0}
            icon={CheckSquare}
            trend="up"
            trendValue="+8"
            color="secondary"
          />
          <StatsCard
            title="Team Members"
            value={stats?.overview?.totalMembers || 0}
            icon={Users}
            color="secondary"
          />
          <StatsCard
            title="Completion Rate"
            value={`${stats?.overview?.completionRate || 0}%`}
            icon={TrendingUp}
            trend="up"
            trendValue="+5%"
            color="secondary"
          />
        </div>

        {/* Task Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">To Do</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.overview?.todoTasks || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">tasks pending</p>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.overview?.inProgressTasks || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">tasks active</p>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Completed
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.overview?.completedTasks || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">tasks done</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity tasks={stats?.recentTasks || []} />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/projects")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FolderKanban className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900">
                    Create New Project
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button
                onClick={() => navigate("/tasks")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">
                    Create New Task
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button
                onClick={() => navigate("/team")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-gray-900">
                    Invite Team Member
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
