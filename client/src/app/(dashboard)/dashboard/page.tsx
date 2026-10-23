'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Activity,
  AlertTriangle,
  Building2,
  TrendingUp,
  PlusCircle,
  Stethoscope,
  RefreshCw,
  HeartPulse,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Header from '@/components/layout/Header';
import { AnalyticsService } from '@/services/analytics.service';
import { useTheme } from '@/context/ThemeContext';

const CONDITION_COLORS: Record<string, string> = {
  Stable: '#10b981', // Emerald
  Critical: '#f43f5e', // Rose
  Recovering: '#38bdf8', // Sky
  'Under Observation': '#f59e0b', // Amber
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: analyticsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const res = await AnalyticsService.getDashboardAnalytics();
      return res.data;
    },
  });

  const overview = analyticsData?.overview;
  const conditionData = analyticsData?.conditionDistribution || [];
  const topDoctors = analyticsData?.patientsPerDoctor || [];
  const admissionsTrend = analyticsData?.admissionsTimeline || [];
  const hospitalData = analyticsData?.hospitalDistribution || [];

  const chartTheme = {
    grid: isDark ? '#1e293b' : '#e2e8f0',
    axis: isDark ? '#64748b' : '#94a3b8',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#1e293b' : '#e2e8f0',
    tooltipText: isDark ? '#f8fafc' : '#0f172a',
  };

  return (
    <div className="space-y-6">
      <Header
        title="Clinical Analytics Dashboard"
        description="Comprehensive real-time statistics and doctor-patient workload distribution"
      />

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            System Overview & Metrics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time telemetry aggregated from MongoDB collections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-cyan-500' : ''}`} />
            <span>Sync Data</span>
          </button>
          <Link
            href="/doctors"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Doctors</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Doctors */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Doctors
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLoading ? (
                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              ) : (
                overview?.totalDoctors ?? 0
              )}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Full Active Medical Staff</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Patients */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Patients
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLoading ? (
                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              ) : (
                overview?.totalPatients ?? 0
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
              <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Currently In Active Care</span>
            </div>
          </div>
        </div>

        {/* Card 3: Patients Per Doctor */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Patients Per Doctor
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLoading ? (
                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              ) : (
                overview?.avgPatientsPerDoctor ?? 0
              )}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1">
              <span>Average Workload Ratio</span>
            </div>
          </div>
        </div>

        {/* Card 4: Critical Cases */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Critical Cases
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLoading ? (
                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              ) : (
                overview?.criticalPatients ?? 0
              )}
            </div>
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
              <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
              <span>Requires High Attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admissions Trend (Area Chart) - Spans 2 Cols */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Patient Admissions Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly patient intake timeline (last 6 months)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
              Time-Series
            </span>
          </div>

          <div className="h-72 w-full mt-2">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={admissionsTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="admissionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="monthYear" stroke={chartTheme.axis} fontSize={12} tickLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '0.75rem',
                      color: chartTheme.tooltipText,
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="admissions"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#admissionGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Patient Condition Breakdown (Donut Chart) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Patient Conditions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Severity distribution ratio</p>
            </div>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            {isLoading ? (
              <div className="w-36 h-36 rounded-full border-4 border-slate-200 dark:border-slate-800 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionData}
                    dataKey="count"
                    nameKey="condition"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {conditionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CONDITION_COLORS[entry.condition] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '0.75rem',
                      color: chartTheme.tooltipText,
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Condition Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {conditionData.map((item) => (
              <div key={item.condition} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CONDITION_COLORS[item.condition] || '#94a3b8' }}
                />
                <span className="text-slate-600 dark:text-slate-300 truncate">{item.condition}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Workload & Hospital Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Doctors by Patient Count */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Doctors by Patient Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top physicians managing highest patient cohorts
              </p>
            </div>
            <Link
              href="/doctors"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-semibold"
            >
              View All Doctors &rarr;
            </Link>
          </div>

          <div className="h-64 w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topDoctors}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                  <XAxis type="number" stroke={chartTheme.axis} fontSize={11} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={chartTheme.axis}
                    fontSize={11}
                    width={110}
                    tickFormatter={(val) => val.replace('Dr. ', '')}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '0.75rem',
                      color: chartTheme.tooltipText,
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="patientCount"
                    name="Patients Assigned"
                    fill="#10b981"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Hospital Network Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Hospital Network Allocation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient volume & doctor capacity across medical facilities
              </p>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hospitalData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="hospital" stroke={chartTheme.axis} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '0.75rem',
                      color: chartTheme.tooltipText,
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}
                  />
                  <Bar
                    dataKey="totalPatients"
                    name="Total Patients"
                    fill="#38bdf8"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="doctorCount"
                    name="Doctors Assigned"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
