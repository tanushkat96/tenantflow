import { formatDistanceToNow } from 'date-fns';

function RecentActivity({ tasks }) {
  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      inprogress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
    };
    return colors[status] || colors.todo;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task._id} className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.projectId && (
                      <span className="text-xs text-gray-500">
                        {task.projectId.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {task.assignee && (
                    <div className="flex items-center justify-end mb-1">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {task.assignee.firstName?.charAt(0)}
                        {task.assignee.lastName?.charAt(0)}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;