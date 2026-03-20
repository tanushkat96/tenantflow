const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

// Helper function to calculate project progress
const calculateProjectProgress = async (projectId) => {
  try {
    const tasks = await Task.find({ projectId });

    if (tasks.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        review: 0,
        progressPercentage: 0,
      };
    }

    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "inprogress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const review = tasks.filter((t) => t.status === "review").length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      todo,
      review,
      progressPercentage: Math.round((completed / tasks.length) * 100),
    };
  } catch (error) {
    console.error("Error calculating progress:", error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      review: 0,
      progressPercentage: 0,
    };
  }
};

// Check if user is project member or owner
const isProjectMember = (project, userId) => {
  return (
    project.owner.toString() === userId.toString() ||
    project.members.some((m) => m.userId.toString() === userId.toString())
  );
};

// ✅ Get all projects (filtered by role and membership)
exports.getAllProjects = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let query = { tenantId: req.user.tenantId };

    // ✅ RBAC: Filter projects based on role
    if (userRole !== 'owner' && userRole !== 'admin') {
      // Members and Viewers can only see projects they're in
      query.$or = [
        { owner: userId },
        { 'members.userId': userId }
      ];
    }

    const projects = await Project.find(query)
      .populate("owner", "firstName lastName email role")
      .populate("members.userId", "firstName lastName email avatar role")
      .sort({ createdAt: -1 });

    // Add progress info to each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const progress = await calculateProjectProgress(project._id);
        
        // ✅ Add permission info for frontend
        const canEdit = userRole === 'owner' || 
                       userRole === 'admin' || 
                       project.owner.toString() === userId.toString();
        
        return {
          ...project.toObject(),
          progress,
          permissions: {
            canEdit,
            canDelete: userRole === 'owner' || userRole === 'admin',
            canManageMembers: userRole === 'owner' || userRole === 'admin',
          }
        };
      }),
    );

    res.json({
      success: true,
      count: projectsWithProgress.length,
      data: projectsWithProgress,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// ✅ Get single project (with permission check)
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    })
      .populate("owner", "firstName lastName email role")
      .populate("members.userId", "firstName lastName email avatar role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ Check if user has access to this project
    const userRole = req.user.role;
    const userId = req.user._id;
    const isMember = isProjectMember(project, userId);

    if (userRole !== 'owner' && userRole !== 'admin' && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    // Calculate progress
    const progress = await calculateProjectProgress(project._id);

    // ✅ Get project tasks with assignee info
    const tasks = await Task.find({ projectId: project._id })
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        progress,
        tasks,
        permissions: {
          canEdit: userRole === 'owner' || userRole === 'admin' || project.owner.toString() === userId.toString(),
          canDelete: userRole === 'owner' || userRole === 'admin',
          canManageMembers: userRole === 'owner' || userRole === 'admin',
        }
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Owner/Admin only)
exports.createProject = async (req, res) => {
  try {
    const userRole = req.user.role;

    // ✅ Only Owner and Admin can create projects
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only Owners and Admins can create projects",
      });
    }

    const { name, description, key, color, members } = req.body;

    // Check if project key already exists for this tenant
    const existingProject = await Project.findOne({
      tenantId: req.user.tenantId,
      key: key.toUpperCase(),
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "Project key already exists",
      });
    }

    // ✅ Process members array
    let projectMembers = [];
    
    if (members && Array.isArray(members)) {
      projectMembers = members.map(member => ({
        userId: member.userId,
        role: member.role || 'member',
        joinedAt: new Date(),
      }));
    }

    // ✅ Auto-add creator to members if not already included
    const creatorExists = projectMembers.some(
      m => m.userId.toString() === req.user._id.toString()
    );

    if (!creatorExists) {
      projectMembers.unshift({
        userId: req.user._id,
        role: "admin",
        joinedAt: new Date(),
      });
    }

    const project = await Project.create({
      tenantId: req.user.tenantId,
      name,
      description,
      key: key.toUpperCase(),
      color: color || "#3B82F6",
      owner: req.user._id,
      members: projectMembers,
      progress: 0,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "firstName lastName email role")
      .populate("members.userId", "firstName lastName email avatar role");

    // ✅ Calculate initial progress
    const progress = await calculateProjectProgress(project._id);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        ...populatedProject.toObject(),
        progress,
      },
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner/Admin only)
exports.updateProject = async (req, res) => {
  try {
    const userRole = req.user.role;

    // ✅ Only Owner and Admin can update projects
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only Owners and Admins can update projects",
      });
    }

    const { name, description, color, status, members } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update basic fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (status) project.status = status;

    // ✅ Update members if provided
    if (members && Array.isArray(members)) {
      const projectMembers = members.map(member => ({
        userId: member.userId,
        role: member.role || 'member',
        joinedAt: member.joinedAt || new Date(),
      }));

      // Ensure owner is in members
      const ownerExists = projectMembers.some(
        m => m.userId.toString() === project.owner.toString()
      );

      if (!ownerExists) {
        projectMembers.unshift({
          userId: project.owner,
          role: "admin",
          joinedAt: project.createdAt || new Date(),
        });
      }

      project.members = projectMembers;
    }

    await project.save();

    // ✅ Recalculate progress after update
    const progress = await calculateProjectProgress(project._id);
    project.progress = progress.progressPercentage;
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "firstName lastName email role")
      .populate("members.userId", "firstName lastName email avatar role");

    res.json({
      success: true,
      message: "Project updated successfully",
      data: {
        ...populatedProject.toObject(),
        progress,
      },
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// ✅ Delete project (Owner/Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const userRole = req.user.role;

    // ✅ Only Owner and Admin can delete projects
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only Owners and Admins can delete projects",
      });
    }

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ Delete all tasks in this project
    await Task.deleteMany({ projectId: project._id });

    res.json({
      success: true,
      message: "Project and associated tasks deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// ✅ Add member to project (Owner/Admin only)
exports.addMember = async (req, res) => {
  try {
    const userRole = req.user.role;

    // ✅ Only Owner and Admin can add members
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only Owners and Admins can add project members",
      });
    }

    const { userId, role } = req.body;

    // Verify user exists and belongs to same tenant
    const user = await User.findOne({
      _id: userId,
      tenantId: req.user.tenantId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is already a member
    const existingMember = project.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    project.members.push({
      userId,
      role: role || "member",
      joinedAt: new Date(),
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "firstName lastName email role")
      .populate("members.userId", "firstName lastName email avatar role");

    res.json({
      success: true,
      message: "Member added successfully",
      data: populatedProject,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};

// ✅ Remove member from project (Owner/Admin only)
exports.removeMember = async (req, res) => {
  try {
    const userRole = req.user.role;

    // ✅ Only Owner and Admin can remove members
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only Owners and Admins can remove project members",
      });
    }

    const { memberId } = req.params;

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ Prevent removing project owner
    if (project.owner.toString() === memberId) {
      return res.status(403).json({
        success: false,
        message: "Cannot remove project owner",
      });
    }

    project.members = project.members.filter(
      (m) => m.userId.toString() !== memberId,
    );

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "firstName lastName email role")
      .populate("members.userId", "firstName lastName email avatar role");

    res.json({
      success: true,
      message: "Member removed successfully",
      data: populatedProject,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

// ✅ Get project progress (with access check)
exports.getProjectProgress = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ Check access
    const userRole = req.user.role;
    const userId = req.user._id;
    const isMember = isProjectMember(project, userId);

    if (userRole !== 'owner' && userRole !== 'admin' && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const progress = await calculateProjectProgress(project._id);

    res.json({
      success: true,
      data: {
        projectId: project._id,
        projectName: project.name,
        ...progress,
      },
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
};

// ✅ NEW: Get project tasks with permissions
exports.getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check access
    const userRole = req.user.role;
    const userId = req.user._id;
    const isMember = isProjectMember(project, userId);

    if (userRole !== 'owner' && userRole !== 'admin' && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const tasks = await Task.find({ projectId: req.params.id })
      .populate('assignedTo', 'firstName lastName email role avatar')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // ✅ Add permission info for each task
    const tasksWithPermissions = tasks.map(task => {
      const isAssigned = task.assignedTo.some(a => a._id.toString() === userId.toString());
      
      return {
        ...task.toObject(),
        permissions: {
          canEdit: userRole === 'owner' || userRole === 'admin' || isAssigned,
          canDelete: userRole === 'owner' || userRole === 'admin',
          canAssign: userRole === 'owner' || userRole === 'admin',
        }
      };
    });

    res.json({
      success: true,
      data: tasksWithPermissions,
    });
  } catch (error) {
    console.error("Get project tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project tasks",
      error: error.message,
    });
  }
};