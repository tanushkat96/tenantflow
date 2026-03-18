const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectProgress,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

// Project CRUD
router.route("/").get(getAllProjects).post(createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

// Project progress
router.get("/:id/progress", getProjectProgress);

// Member management
router.post("/:id/members", addMember);
router.delete("/:id/members/:memberId", removeMember);

module.exports = router;
