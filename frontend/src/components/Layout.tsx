import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Mic2, LayoutGrid, LogIn, BookMarked, Settings, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SearchBar } from './SearchBar';

const navItems = [
  { to: '/conferences', label: 'Conferences', icon: CalendarDays },
  { to: '/speakers', label: 'Speakers', icon: Mic2 },
  { to: '/schedule', label: 'Schedule', icon: LayoutGrid },
];

export function Layout() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/my-schedule'
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-[#1a0f0a]">
      <header className="bg-brand-surface dark:bg-[#2c1810] border-b border-brand-border dark:border-[#4a2e20] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <CalendarDays className="w-7 h-7 text-brand-accent" />
              <span className="font-bold text-brand-primary dark:text-[#f5f0eb] text-lg tracking-tight">ConferenceApp</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'text-brand-accent bg-brand-accent/10'
                      : 'text-brand-muted dark:text-[#c4a882] hover:text-brand-primary dark:hover:text-[#f5f0eb] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <SearchBar />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-schedule"
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-schedule')
                        ? 'text-brand-accent bg-brand-accent/10'
                        : 'text-brand-muted dark:text-[#c4a882] hover:text-brand-primary dark:hover:text-[#f5f0eb] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40'
                    }`}
                  >
                    <BookMarked className="w-4 h-4" />
                    My Schedule
                  </Link>
                  {user?.role === 'Admin' && (
                    <Link
                      to="/admin"
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin')
                          ? 'text-brand-accent bg-brand-accent/10'
                          : 'text-brand-muted dark:text-[#c4a882] hover:text-brand-primary dark:hover:text-[#f5f0eb] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  <span className="text-sm text-brand-muted dark:text-[#c4a882] hidden lg:block">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border dark:border-[#4a2e20] text-brand-muted dark:text-[#c4a882] text-sm font-medium hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 hover:text-brand-primary dark:hover:text-[#f5f0eb] transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-lg text-brand-muted dark:text-[#c4a882] hover:text-brand-primary dark:hover:text-[#f5f0eb] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 rounded-lg text-brand-muted dark:text-[#c4a882] hover:text-brand-primary dark:hover:text-[#f5f0eb] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 transition-colors"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-brand-border dark:border-[#4a2e20] bg-brand-surface dark:bg-[#2c1810]">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-brand-accent/10 text-brand-accent'
                      : 'text-brand-muted dark:text-[#c4a882] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 hover:text-brand-primary dark:hover:text-[#f5f0eb]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-schedule"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-schedule')
                        ? 'bg-brand-accent/10 text-brand-accent'
                        : 'text-brand-muted dark:text-[#c4a882] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 hover:text-brand-primary dark:hover:text-[#f5f0eb]'
                    }`}
                  >
                    <BookMarked className="w-4 h-4" />
                    My Schedule
                  </Link>
                  {user?.role === 'Admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin')
                          ? 'bg-brand-accent/10 text-brand-accent'
                          : 'text-brand-muted dark:text-[#c4a882] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 hover:text-brand-primary dark:hover:text-[#f5f0eb]'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  <div className="pt-2 border-t border-brand-border dark:border-[#4a2e20]">
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-muted dark:text-[#c4a882] hover:bg-brand-border/30 dark:hover:bg-[#4a2e20]/40 hover:text-brand-primary dark:hover:text-[#f5f0eb] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-accent/10 text-brand-accent"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
