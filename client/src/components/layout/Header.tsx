'use client';

import React from 'react';
import { Bell, HeartPulse } from 'lucide-react';

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({
  title = 'Overview',
  description = 'Real-time hospital administrative metrics and management console',
}: HeaderProps) {
  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <span>{title}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            Live Database
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <HeartPulse className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-600 dark:text-emerald-400">Node REST API Connected</span>
        </div>

        {/* Quick action or notification badge */}
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

