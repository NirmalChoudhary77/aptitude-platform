import { BookOpen, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/pyq', label: 'PYQ Library', icon: BookOpen },
];

function NavLink({ item, onClick }) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = location.pathname === item.to;

  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
        isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      }`}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export default function StudentLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login', { replace: true });
    if (!isLoading && user?.role === 'teacher') navigate('/teacher', { replace: true });
  }, [isAuthenticated, isLoading, navigate, user]);

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (isLoading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm font-semibold text-slate-500">Loading workspace...</div>;
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-lg font-extrabold tracking-tight text-slate-950">Aptitude Platform</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Student workspace</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => <NavLink key={item.to} item={item} onClick={() => setMobileOpen(false)} />)}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-bold text-slate-900">{user.full_name}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
        <button type="button" onClick={signOut} className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <p className="text-lg font-extrabold text-slate-950">Aptitude Platform</p>
        <button type="button" onClick={() => setMobileOpen((value) => !value)} className="rounded-md border border-slate-200 p-2">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {mobileOpen && <div className="fixed inset-0 z-20 bg-white pt-16 lg:hidden">{sidebar}</div>}
      <main className="px-4 py-6 lg:ml-64 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
