import { MoreVertical, Mail, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";

function MemberCard({ member, currentUser, onChangeRole, onRemove }) {
  const [showMenu, setShowMenu] = useState(false);

  const roleColors = {
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    member: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800",
  };

  const roleIcons = {
    owner: Shield,
    admin: Shield,
    member: UserIcon,
    viewer: UserIcon,
  };

  const RoleIcon = roleIcons[member.role] || UserIcon;

  const isCurrentUser = currentUser?._id === member._id;
  const canManage =
    currentUser?.role === "owner" ||
    (currentUser?.role === "admin" && member.role !== "owner");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* User Info */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {member.firstName?.charAt(0)}
            {member.lastName?.charAt(0)}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {member.firstName} {member.lastName}
                {isCurrentUser && (
                  <span className="text-sm text-gray-500 ml-2">(You)</span>
                )}
              </h3>
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>

            {/* Role Badge */}
            <div className="mt-2">
              <span
                className={`inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full font-medium ${roleColors[member.role]}`}
              >
                <RoleIcon className="w-3 h-3" />
                <span className="capitalize">{member.role}</span>
              </span>
            </div>

            {/* Join Date */}
            <p className="text-xs text-gray-500 mt-2">
              Joined {new Date(member.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        {canManage && !isCurrentUser && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {/* Change Role */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Change Role
                  </div>
                  {["admin", "member", "viewer"].map(
                    (role) =>
                      member.role !== role && (
                        <button
                          key={role}
                          onClick={() => {
                            setShowMenu(false);
                            onChangeRole(member, role);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                        >
                          {role}
                        </button>
                      ),
                  )}

                  <hr className="my-1" />

                  {/* Remove Member */}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRemove(member);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove from team
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberCard;
