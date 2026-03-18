const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAllUsers,
  getPendingInvitations,
  inviteUser,
  getInvitation,
  acceptInvitation,
  updateUserRole,
  removeUser,
  cancelInvitation,
} = require("../controllers/userController");

// @route   GET /api/users
// @desc    Get all users in tenant
// @access  Private
router.get("/", protect, getAllUsers);

// @route   GET /api/users/invitations/pending
// @desc    Get all pending invitations for tenant
// @access  Private
router.get("/invitations/pending", protect, getPendingInvitations);

// @route   POST /api/users/invite
// @desc    Invite a new user
// @access  Private (Owner/Admin only)
router.post("/invite", protect, inviteUser);

// @route   GET /api/users/invitation/:token
// @desc    Get invitation details (public)
// @access  Public
router.get("/invitation/:token", getInvitation);

// @route   POST /api/users/invitation/accept
// @desc    Accept invitation and create account
// @access  Public
router.post("/invitation/accept", acceptInvitation);

// @route   DELETE /api/users/invitations/:invitationId
// @desc    Cancel invitation
// @access  Private (Owner/Admin only)
router.delete("/invitations/:invitationId", protect, cancelInvitation);

// @route   PATCH /api/users/:userId/role
// @desc    Update user role
// @access  Private (Owner/Admin only)
router.patch("/:userId/role", protect, updateUserRole);

// @route   DELETE /api/users/:userId
// @desc    Remove user from tenant
// @access  Private (Owner/Admin only)
router.delete("/:userId", protect, removeUser);

module.exports = router;
