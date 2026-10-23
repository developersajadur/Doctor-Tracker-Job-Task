'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  LogOut,
  Activity,
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { IUser } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme, toggleTheme } = useTheme();

  const [currentUser] = useState<IUser | null>(() => {
    return AuthService.getCurrentUser();
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('doctor_tracker_sidebar_collapsed');
        if (stored !== null) {
          return stored === 'true';
        }
      } catch {}
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('doctor_tracker_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'Doctors',
      href: '/doctors',
      icon: UserCheck,
      active: pathname.startsWith('/doctors'),
    },
    {
      name: 'Patients',
      href: '/patients',
      icon: Users,
      active: pathname.startsWith('/patients'),
    },
  ];

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">
              Doctor Tracker
            </span>
            <span className="text-xs block text-cyan-600 dark:text-cyan-400 font-medium">
              Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme toggle for mobile */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-cyan-600" />
            )}
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white/95 lg:bg-white/80 dark:bg-slate-950/95 lg:dark:bg-slate-950/70 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } ${isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="p-4 lg:p-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 group overflow-hidden ${
              isCollapsed ? 'lg:justify-center lg:w-full' : ''
            }`}
          >
            <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25 transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                  Doctor Tracker
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Clinical Portal v1.0
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Collapse / Expand Toggle Button */}
          {(!isCollapsed || isMobileOpen) && (
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand button on desktop */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center py-2 px-2 border-b border-slate-200 dark:border-slate-800/60">
            <button
              onClick={toggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/70 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="px-3 py-5 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Main Management
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
                  } ${
                    link.active
                      ? 'bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 min-w-5 shrink-0 ${
                      link.active
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{link.name}</span>
                  )}
                  {link.active && (!isCollapsed || isMobileOpen) && (
                    <span className="ml-auto w-1.5 h-4 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
                  )}
                </Link>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && !isMobileOpen && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap border border-slate-700/80">
                    {link.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Theme Mode Option & User Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
          {/* Dark / Light Mode Selector */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-1.5">
              <div className="px-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center justify-between">
                <span>Appearance</span>
                <span className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400 capitalize">
                  {theme} Mode
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : ''}`} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed Single-button Theme Toggle */
            <div className="relative group flex justify-center">
              <button
                type="button"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-200/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:scale-105 transition-all cursor-pointer shadow-sm"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </button>

              {/* Floating Tooltip */}
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap border border-slate-700/80">
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </div>
            </div>
          )}

          {/* User Card & Logout */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="pt-1">
              <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-xl bg-white/70 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400 inline" />
                    <span className="capitalize">{currentUser?.role || 'admin'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Collapsed User & Logout */
            <div className="space-y-2 pt-1">
              <div className="relative group flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow cursor-default">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
                </div>
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap border border-slate-700/80">
                  <div className="font-semibold">{currentUser?.name || 'Administrator'}</div>
                  <div className="text-[10px] text-cyan-400 capitalize">{currentUser?.role || 'admin'}</div>
                </div>
              </div>

              <div className="relative group flex justify-center">
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 text-rose-300 text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap border border-slate-700/80">
                  Sign Out
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </>
  );
}
