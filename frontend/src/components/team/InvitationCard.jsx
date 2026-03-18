import { Mail, Clock, X } from 'lucide-react';

function InvitationCard({ invitation, onCancel }) {
  const roleColors = {
    admin: 'bg-blue-100 text-blue-800',
    member: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
  };

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const status = isExpired ? 'expired' : invitation.status;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Icon */}
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-gray-600" />
          </div>

          {/* Details */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {invitation.email}
            </p>
            
            <div className="flex items-center space-x-2 mt-1">
              {/* Role */}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[invitation.role]}`}>
                {invitation.role}
              </span>
              
              {/* Status */}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[status]}`}>
                {status}
              </span>
            </div>

            {/* Expiry */}
            <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {isExpired 
                  ? 'Expired' 
                  : `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {status === 'pending' && (
          <button
            onClick={() => onCancel(invitation)}
            className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-600"
            title="Cancel invitation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default InvitationCard;