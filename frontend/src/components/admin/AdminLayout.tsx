import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Mic2, LayoutList } from 'lucide-react';

const adminNavItems = [
  { to: '/admin/conferences', label: 'Conferences', icon: CalendarDays },
  { to: '/admin/sessions', label: 'Sessions', icon: LayoutList },
  { to: '/admin/speakers', label: 'Speakers', icon: Mic2 },
];

export function AdminLayout() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex gap-6">
      <aside className="w-48 shrink-0">
        <nav className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Admin</p>
          {adminNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-accent/10 text-brand-accent'
                    : 'text-brand-muted hover:bg-brand-border/30 hover:text-brand-primary'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
