import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { Bell, Search, LogOut } from "lucide-react";

function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="glass border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-6 py-4 gap-6">
        {/* Center - Search Bar */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl flex items-center space-x-2 glass-light rounded-xl px-4 py-3 bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500 transition-all">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-purple-600 transition-colors flex-shrink-0" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-gray-500 bg-white/70 rounded flex-shrink-0">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-110 group">
            <Bell className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all transform hover:scale-105 group"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
          </button>

          {/* Profile Icon */}
          <button
            onClick={handleProfileClick}
            className="relative p-2.5 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-110 group"
            title="Go to profile"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
