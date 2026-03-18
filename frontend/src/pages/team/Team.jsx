import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/layout/Layout";
import MemberCard from "../../components/team/MemberCard";
import InviteModal from "../../components/team/InviteModal";
import InvitationCard from "../../components/team/InvitationCard";
import userService from "../../services/api/userService";
import { UserPlus, Users as UsersIcon, Mail } from "lucide-react";
import toast from "react-hot-toast";

function Team() {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      // Fetch team members
      const membersResponse = await userService.getAllUsers();
      setMembers(membersResponse.data || []);

      // Fetch pending invitations
      const invitationsResponse = await userService.getPendingInvitations();
      setInvitations(invitationsResponse.data || []);
    } catch (error) {
      toast.error("Failed to load team data");
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (inviteData) => {
    try {
      const response = await userService.inviteUser(inviteData);

      if (response.success) {
        // Generate invite link
        const link = `${window.location.origin}/accept-invite/${response.data.token}`;
        setInviteLink(link);

        toast.success("Invitation created successfully!");

        // Refresh invitations list
        fetchTeamData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };

  const handleChangeRole = async (member, newRole) => {
    if (window.confirm(`Change ${member.firstName}'s role to ${newRole}?`)) {
      try {
        await userService.updateUserRole(member._id, newRole);
        toast.success("Role updated successfully!");
        fetchTeamData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update role");
      }
    }
  };

  const handleRemoveMember = async (member) => {
    if (
      window.confirm(
        `Remove ${member.firstName} ${member.lastName} from the team?`,
      )
    ) {
      try {
        await userService.removeUser(member._id);
        toast.success("Member removed successfully!");
        fetchTeamData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove member");
      }
    }
  };

  const handleCancelInvitation = async (invitation) => {
    if (window.confirm(`Cancel invitation to ${invitation.email}?`)) {
      try {
        await userService.cancelInvitation(invitation._id);
        toast.success("Invitation cancelled!");
        fetchTeamData();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to cancel invitation",
        );
        console.error("Error cancelling invitation:", error);
      }
    }
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteLink("");
  };

  const canInvite =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and invitations
            </p>
          </div>

          {canInvite && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-300 transition"
            >
              <UserPlus className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Invitations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invitations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Invitations ({invitations.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {invitations.map((invitation) => (
                    <InvitationCard
                      key={invitation._id}
                      invitation={invitation}
                      onCancel={handleCancelInvitation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Team Members */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Team Members ({members.length})
              </h2>

              {members.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {members.map((member) => (
                    <MemberCard
                      key={member._id}
                      member={member}
                      currentUser={currentUser}
                      onChangeRole={handleChangeRole}
                      onRemove={handleRemoveMember}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No team members yet</p>
                  {canInvite && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Invite your first team member
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={handleCloseInviteModal}
        onInvite={handleInvite}
        inviteLink={inviteLink}
      />
    </Layout>
  );
}

export default Team;
