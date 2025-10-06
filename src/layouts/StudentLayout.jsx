// src/layouts/StudentLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Icons (simple SVGs for demonstration)
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16z" /></svg>;

const NavLink = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <motion.div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {icon}
        <span className="font-semibold">{children}</span>
      </motion.div>
    </Link>
  );
};

export default function StudentLayout() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem("auth") || sessionStorage.getItem("auth") || '{}');

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <motion.aside 
        className="w-64 bg-neutral-800 border-r border-neutral-700 p-4 flex flex-col"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">AptitudePro</h1>
          <span className="text-sm text-primary-light">Student Portal</span>
        </div>
        <nav className="space-y-2">
          <NavLink to="/student" icon={<DashboardIcon />}>Dashboard</NavLink>
          <NavLink to="/student/pyq" icon={<BookIcon />}>PYQ Library</NavLink>
        </nav>
        <div className="mt-auto">
          <div className="border-t border-neutral-700 pt-4">
            <p className="text-sm text-white font-semibold">{auth.name || 'Student'}</p>
            <p className="text-xs text-neutral-400">{auth.email}</p>
            <button
              onClick={handleLogout}
              className="mt-3 text-left w-full text-neutral-400 hover:text-red-400 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 bg-neutral-900 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}