import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <aside
      className={`glass transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col relative overflow-hidden`}
    >
      {/* Decorative Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

      {/* Logo Section */}
      <div className="relative p-6  flex items-center justify-evenly border-b border-gray-200">
        <div className="flex items-center space-x-3">
           <button
          onClick={onToggle}
          className=" rounded-lg hover:bg-purple-100 transition-colors text-gray-700 hover:text-purple-600"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
         
        
        <div className={`w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110  transition-transform duration-300 ${
              isOpen ? "rotate-0" : "rotate-180"
            }`}>
            <Sparkles className="w-6 h-6 text-white" />
           
          </div>
         
          </button>
        </div>
         {isOpen && (
            <span className="text-xl font-bold gradient-text animate-slideIn">
              TenantFlow
            </span>
          )}
        

        {/* Toggle Button */}
        
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-purple-50"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              title={!isOpen ? item.label : ""}
            >
              {/* ✅ Icon always visible */}
              <Icon
                className={`w-5 h-5 relative z-10 flex-shrink-0 ${
                  isActive
                    ? "text-white"
                    : "text-gray-600 group-hover:text-purple-600"
                } transition-colors`}
              />

              {/* ✅ Label only when expanded */}
              {isOpen && (
                <span className="font-medium relative z-10 animate-slideIn">
                  {item.label}
                </span>
              )}

              {/* Active Indicator */}
              {isActive && isOpen && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Tip - only when expanded */}
      {isOpen && (
        <div className="relative p-4 border-t border-gray-200">
          <div className="glass-light p-4 rounded-xl animate-fadeIn">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 mb-1">
                  Pro Tip
                </p>
                <p className="text-xs text-gray-600">
                  Drag tasks between columns to update status
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
