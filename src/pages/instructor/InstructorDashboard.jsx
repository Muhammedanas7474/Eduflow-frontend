import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstructorDashboard } from "../../api/auth.api";

// Icons
const Icons = {
  Courses: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Students: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>,
  Lessons: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getInstructorDashboard();
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
    { label: "Total Courses", value: stats.total_courses, icon: Icons.Courses, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Courses", value: stats.active_courses, icon: Icons.Courses, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Lessons", value: stats.total_lessons, icon: Icons.Lessons, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Students", value: stats.total_students, icon: Icons.Students, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Pending Enrollments", value: stats.pending_enrollments, icon: Icons.Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Avg Completion Rate", value: `${stats.avg_completion_rate}%`, icon: Icons.Chart, color: "text-pink-500", bg: "bg-pink-500/10" },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Instructor <span className="text-emerald-500">Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-2">Overview of your courses and students</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <div className={stat.color}>
                    <stat.icon />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-zinc-400">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/instructor/courses" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Icons.Courses />
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">My Courses</h3>
          </div>
          <p className="text-sm text-zinc-400">Create and manage your course content</p>
        </Link>
        <Link to="/instructor/enrollments" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <Icons.Clock />
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">Enrollment Requests</h3>
          </div>
          <p className="text-sm text-zinc-400">Approve or reject student enrollments</p>
        </Link>
        <Link to="/instructor/analytics" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Icons.Chart />
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">Analytics</h3>
          </div>
          <p className="text-sm text-zinc-400">View detailed course analytics</p>
        </Link>
      </div>
    </div>
  );
}
