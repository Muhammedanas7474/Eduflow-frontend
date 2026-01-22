import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../api/auth.api";

// Icons
const Icons = {
  Users: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
  Courses: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getAdminDashboard();
        const data = response.data?.data || response.data;
        setStats(data.stats);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: Icons.Users, color: "bg-blue-500", link: "/admin/users" },
    { label: "Total Students", value: stats.total_students, icon: Icons.Users, color: "bg-emerald-500" },
    { label: "Total Instructors", value: stats.total_instructors, icon: Icons.Users, color: "bg-purple-500" },
    { label: "Total Courses", value: stats.total_courses, icon: Icons.Courses, color: "bg-cyan-500", link: "/admin/moderation" },
    { label: "Active Courses", value: stats.active_courses, icon: Icons.Courses, color: "bg-green-500" },
    { label: "Pending Approvals", value: stats.pending_approvals, icon: Icons.Clock, color: "bg-yellow-500", link: "/admin/enrollments" },
    { label: "Total Enrollments", value: stats.total_enrollments, icon: Icons.Chart, color: "bg-indigo-500" },
    { label: "Enrollments This Week", value: stats.enrollments_this_week, icon: Icons.Chart, color: "bg-pink-500" },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Admin <span className="text-emerald-500">Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-2">Overview of your platform statistics</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color}/10 flex items-center justify-center`}>
                  <div className={`${stat.color.replace('bg-', 'text-')}`}>
                    <stat.icon />
                  </div>
                </div>
                {stat.link && (
                  <Link to={stat.link} className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors">
                    View →
                  </Link>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/moderation" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">Course Moderation</h3>
          <p className="text-sm text-zinc-400 mt-2">Review and approve course submissions</p>
        </Link>
        <Link to="/admin/enrollments" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">Enrollment Approvals</h3>
          <p className="text-sm text-zinc-400 mt-2">Manage student enrollment requests</p>
        </Link>
        <Link to="/admin/users" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">User Management</h3>
          <p className="text-sm text-zinc-400 mt-2">Manage students and instructors</p>
        </Link>
      </div>
    </div>
  );
}
