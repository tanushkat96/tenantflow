import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SocketProvider } from './context/SocketContext.jsx';
import { ToastProvider } from './components/notifications/ToastContainer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import Tasks from './pages/tasks/Tasks';
import Team from './pages/team/Team';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';

// Layout
import Layout from './components/layout/Layout';

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Router>
      <ToastProvider>
        {token ? (
          <SocketProvider>
            <Routes>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/projects" element={<Layout><Projects /></Layout>} />
              <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
              <Route path="/team" element={<Layout><Team /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </SocketProvider>
        ) : (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </ToastProvider>
    </Router>
  );
}

export default App;