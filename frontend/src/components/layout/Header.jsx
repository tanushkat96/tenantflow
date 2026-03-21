import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { Menu, Bell, Search, LogOut, User, Settings as SettingsIcon, FolderKanban } from 'lucide-react';
import { useState } from 'react';

function Header({ onMenuClick, sidebarOpen }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="glass border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button OR desktop expand button when sidebar collapsed */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-purple-50 transition-all transform hover:scale-110"
            title={sidebarOpen ? 'Toggle menu' : 'Expand sidebar'}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo - visible on mobile and tablet */}
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">TenantFlow</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2 glass-light rounded-xl px-4 py-2.5 w-80 group focus-within:ring-2 focus-within:ring-purple-500 transition-all">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-purple-600 transition-colors" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-gray-500 bg-white/70 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-110 group">
            <Bell className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-2xl py-2 z-20 animate-fadeIn border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-purple-50 transition-all group"
                  >
                    <User className="w-5 h-5 group-hover:text-purple-600 transition-colors" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-purple-50 transition-all group"
                  >
                    <SettingsIcon className="w-5 h-5 group-hover:text-purple-600 transition-colors" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-all group"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
