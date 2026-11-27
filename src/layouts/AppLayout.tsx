import {
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Wand2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Logo } from '../components/Logo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface AppLayoutProps {
  currentPath: string;
  pageTitle: string;
  pageSubtitle?: string;
  navigate: (to: string) => void;
  children: React.ReactNode;
}

export function AppLayout({
  currentPath,
  pageTitle,
  pageSubtitle,
  navigate,
  children,
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Generate Quiz', path: '/generate', icon: Wand2 },
    { label: 'Quiz History', path: '/history', icon: History },
    { label: 'Profile & Settings', path: '/profile', icon: Settings },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#171717] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#E5E5E3]">
        <div className="h-16 px-5 flex items-center border-b border-[#E5E5E3]">
          <Logo onClick={() => handleNav('/dashboard')} />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              currentPath === item.path ||
              (item.path === '/history' && currentPath.startsWith('/results/'));
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#5145CD]/8 text-[#5145CD]'
                    : 'text-[#525252] hover:text-[#171717] hover:bg-[#F8F8F6]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#E5E5E3]">
          <button
            type="button"
            onClick={() => handleNav('/profile')}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8F8F6] transition-colors text-left cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-[#171717] text-white text-xs font-medium flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#171717] truncate">{user?.name}</p>
              <p className="text-xs text-[#737373] truncate">{user?.email}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#737373] hover:text-[#171717] hover:bg-[#F8F8F6] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#171717]/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white h-full border-r border-[#E5E5E3] flex flex-col">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#E5E5E3]">
              <Logo onClick={() => handleNav('/dashboard')} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F8F8F6] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#5145CD]/8 text-[#5145CD]'
                        : 'text-[#525252] hover:text-[#171717] hover:bg-[#F8F8F6]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#E5E5E3] space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#171717] text-white text-xs font-medium flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#171717] truncate">{user?.name}</p>
                  <p className="text-xs text-[#737373] truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] border border-[#E5E5E3] rounded-lg hover:bg-[#F8F8F6] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-[#F8F8F6]/90 backdrop-blur-md border-b border-[#E5E5E3] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#525252] hover:text-[#171717] hover:bg-white cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-semibold text-[#171717] truncate">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="hidden sm:block text-xs text-[#737373] truncate">{pageSubtitle}</p>
              )}
            </div>
          </div>

          {currentPath !== '/generate' && (
            <button
              type="button"
              onClick={() => navigate('/generate')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Quiz</span>
            </button>
          )}
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
