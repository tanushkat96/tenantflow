import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../components/layout/Layout";
import ProjectCard from "../../components/projects/ProjectCard";
import ProjectModal from "../../components/projects/ProjectModal";
import projectService from "../../services/api/projectService";
import {
  setProjects,
  addProject,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
  setLoading,
} from "../../redux/slices/projectSlice";
import { Plus, Search, Filter, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function Projects() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { projects, loading } = useSelector((state) => state.projects);

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ✅ Check if user can create projects
  const canCreateProject =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  const fetchProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await projectService.getAllProjects();
      dispatch(setProjects(response.data));
    } catch (error) {
      toast.error("Failed to load projects");
      console.error("Error fetching projects:", error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData);
      dispatch(addProject(response.data));
      toast.success("Project created successfully!");
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
      throw error;
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      const response = await projectService.updateProject(
        selectedProject._id,
        projectData,
      );
      dispatch(updateProjectAction(response.data));
      toast.success("Project updated successfully!");
      setShowModal(false);
      setSelectedProject(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project");
      throw error;
    }
  };

  const handleDeleteProject = async (project) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${project.name}"? This will also delete all associated tasks.`,
      )
    ) {
      try {
        await projectService.deleteProject(project._id);
        dispatch(deleteProjectAction(project._id));
        toast.success("Project deleted successfully!");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete project",
        );
      }
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // ✅ Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.key.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              {canCreateProject
                ? "Manage your projects and track progress"
                : "View projects you have access to"}
            </p>
          </div>

          {/* ✅ Create Project Button (only for Owner/Admin) */}
          {canCreateProject && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          )}
        </div>

        {/* ✅ Info Banner for Members/Viewers */}
        {!canCreateProject && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Project Access
                </p>
                <p className="text-sm text-accent mt-1">
                  You can view projects you're a member of. Contact an
                  administrator to create new projects or request access to
                  additional projects.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <>
            <div className="text-sm text-gray-600 mb-2">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm || filterStatus !== "all"
                ? "No projects found"
                : canCreateProject
                  ? "No projects yet"
                  : "No projects assigned to you"}
            </p>
            {canCreateProject && !searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-primary hover:text-accent font-medium"
              >
                Create your first project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
        project={selectedProject}
      />
    </Layout>
  );
}

export default Projects;
