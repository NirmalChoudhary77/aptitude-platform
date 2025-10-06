// src/layouts/TeacherLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Icons
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>;


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

export default function TeacherLayout() {
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
          <span className="text-sm text-primary-light">Teacher Portal</span>
        </div>
        <nav className="space-y-2">
                <NavLink to="/teacher" icon={<DashboardIcon />}>Dashboard</NavLink>
                <NavLink to="/teacher/question-bank" icon={<DocumentIcon />}>Question Bank</NavLink> {/* Add this line */}
                <NavLink to="/teacher/exams/create" icon={<PlusIcon />}>Create Exam</NavLink>
                  <NavLink to="/teacher/analytics" icon={<ChartIcon />}>Analytics</NavLink> {/* Add this line */}

              </nav>
        <div className="mt-auto">
          <div className="border-t border-neutral-700 pt-4">
            <p className="text-sm text-white font-semibold">{auth.name || 'Teacher'}</p>
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