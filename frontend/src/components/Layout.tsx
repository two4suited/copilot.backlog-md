import { Link, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Mic2, LayoutGrid, LogIn, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/conferences', label: 'Conferences', icon: CalendarDays },
  { to: '/speakers', label: 'Speakers', icon: Mic2 },
  { to: '/schedule', label: 'Schedule', icon: LayoutGrid },
];

export function Layout() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-indigo-600" />
              <span className="font-bold text-slate-900 text-lg">ConferenceApp</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(to)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 hidden sm:block">{user?.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
