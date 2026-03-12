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
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

function Projects() {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.projects);

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await projectService.getAllProjects();
      dispatch(setProjects(response.data));
    } catch (error) {
      toast.error("Failed to load projects");
      console.error("Error fetching projects:", error);
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
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

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const handleModalSubmit = (projectData) => {
    if (selectedProject) {
      handleUpdateProject(projectData);
    } else {
      handleCreateProject(projectData);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.key.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage your projects and track progress
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedProject(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-900 transition"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={handleEditClick}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? "No projects found matching your search"
                : "No projects yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
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
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        project={selectedProject}
      />
    </Layout>
  );
}

export default Projects;
