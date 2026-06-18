import { FolderOpen, Activity, AlertTriangle, FileX, Plus, ArrowRight, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { StatCard, Badge, HealthBar, PageHeader } from '../components/ui/index.jsx';
import { useEffect, useState } from 'react';
import api from '../services/api';

// ── Static chart/insight data (not yet from backend) ──────────────────
import {
  trendData,
  statusChartData,
  aiInsights,
  cases as mockCases,
} from '../data/mockData.js';

// ── Styles & helpers ──────────────────────────────────────────────────
const insightStyles = {
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', text: 'text-amber-800' },
  danger:  { bg: 'bg-red-50',   border: 'border-red-200',   icon: 'text-red-500',   text: 'text-red-800'  },
  info:    { bg: 'bg-brand-50', border: 'border-brand-200', icon: 'text-brand-500', text: 'text-brand-800' },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', text: 'text-emerald-800' },
};

const InsightIcon = ({ type }) => {
  if (type === 'warning') return <FileX size={16} />;
  if (type === 'danger')  return <AlertTriangle size={16} />;
  if (type === 'info')    return <Clock size={16} />;
  return <TrendingUp size={16} />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{p.name}: <strong>{p.value}</strong></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Skeleton loader for stat cards ────────────────────────────────────
const StatSkeleton = () => (
  <div className="card p-5 animate-pulse">
    <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
    <div className="h-7 w-16 bg-slate-200 rounded mb-2" />
    <div className="h-3 w-20 bg-slate-100 rounded" />
  </div>
);

// ── Dashboard component ───────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Recent cases — still from mock until Cases integration is done
  const recentCases = mockCases.slice(0, 6);

  useEffect(() => {
    api.dashboard.getStats()
      .then(data => setStats(data))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Derive dynamic AI insights from real stats once loaded
  const dynamicInsights = stats
    ? [
        { type: 'warning', text: `${stats.missing_documents} cases missing critical documents` },
        { type: 'danger',  text: `${stats.high_risk_cases} high-risk cases need immediate attention` },
        { type: 'info',    text: `${stats.active_cases} cases currently active` },
        { type: 'success', text: `${stats.completed_cases} cases completed successfully` },
      ]
    : aiInsights; // fall back to mock while loading

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={
          stats
            ? `You have ${stats.high_risk_cases} high-risk cases needing attention.`
            : 'Loading your dashboard…'
        }
      >
        <Link to="/create-case" className="btn-primary">
          <Plus size={16} />
          New Case
        </Link>
      </PageHeader>

      {/* Error banner */}
      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ Could not load live stats: {error}. Showing mock data below.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [1,2,3,4].map(i => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Cases"
              value={stats?.total_cases ?? '—'}
              icon={FolderOpen}
              iconColor="bg-brand-50 text-brand-600"
              trend="up"
            />
            <StatCard
              title="Active Cases"
              value={stats?.active_cases ?? '—'}
              icon={Activity}
              iconColor="bg-emerald-50 text-emerald-600"
              trend="up"
            />
            <StatCard
              title="High Risk Cases"
              value={stats?.high_risk_cases ?? '—'}
              icon={AlertTriangle}
              iconColor="bg-red-50 text-red-500"
              trend="down"
            />
            <StatCard
              title="Missing Documents"
              value={stats?.missing_documents ?? '—'}
              icon={FileX}
              iconColor="bg-amber-50 text-amber-500"
            />
          </>
        )}
      </div>

      {/* Charts + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Trend Chart */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Case Completion Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">New vs completed cases over 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
              <Area type="monotone" dataKey="new"       name="New Cases" stroke="#6366f1" strokeWidth={2} fill="url(#gradNew)"       dot={false} />
              <Area type="monotone" dataKey="completed" name="Completed"  stroke="#10b981" strokeWidth={2} fill="url(#gradCompleted)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Cases by Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">Current distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {statusChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 gap-1.5 mt-2">
            {statusChartData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Cases Table + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Cases */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Cases</h2>
            <Link to="/cases" className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Case ID', 'Client', 'Type', 'Status', 'Health', 'Updated'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCases.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3">
                      <Link to={`/cases/${c.id}`} className="text-xs font-mono font-semibold text-brand-600 hover:underline">{c.id}</Link>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{c.client}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{c.type}</td>
                    <td className="px-5 py-3"><Badge status={c.status} /></td>
                    <td className="px-5 py-3 min-w-[100px]"><HealthBar score={c.health} /></td>
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{c.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights — driven by real stats */}
        <div className="card">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-md flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">AI Insights</h2>
          </div>
          <div className="p-4 space-y-2.5">
            {dynamicInsights.map((insight, i) => {
              const s = insightStyles[insight.type];
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${s.bg} ${s.border}`}>
                  <div className={`mt-0.5 ${s.icon} shrink-0`}>
                    <InsightIcon type={insight.type} />
                  </div>
                  <p className={`text-xs font-medium leading-relaxed ${s.text}`}>{insight.text}</p>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <Link to="/assistant" className="btn-primary w-full justify-center text-xs py-2.5">
              <Sparkles size={14} />
              Ask AI Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}