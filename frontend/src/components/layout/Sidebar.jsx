import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  X,
} from "lucide-react";

function Sidebar({ isOpen, toggleSidebar, isCollapsed }) {
  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Projects",
      icon: FolderKanban,
      path: "/projects",
    },
    {
      name: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
    },
    {
      name: "Team",
      icon: Users,
      path: "/team",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-20 bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? "w-20" : "w-64"}
          transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 
          pt-12 lg:pt-0
        `}
      >
        {/* Close button for mobile */}
        <div
          className={`lg:hidden flex items-center justify-end h-10 px-4 border-b border-gray-200 flex-shrink-0 ${isCollapsed ? "justify-center" : ""}`}
        >
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`
              }
              title={isCollapsed ? item.name : ""}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          className={`p-4 border-t border-gray-200 flex-shrink-0 ${isCollapsed ? "flex justify-center" : ""}`}
        >
          {!isCollapsed && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-1">
                Need Help?
              </p>
              <p className="text-xs text-blue-700">
                Check out our documentation
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-blue-50 rounded-lg"></div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
