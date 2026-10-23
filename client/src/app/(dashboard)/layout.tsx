import React, { Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Suspense fallback={<div className="w-64 bg-white dark:bg-slate-950/60 border-r border-slate-200 dark:border-slate-800" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 lg:p-8">
          <Suspense fallback={<div className="p-8 text-slate-400">Loading view...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

