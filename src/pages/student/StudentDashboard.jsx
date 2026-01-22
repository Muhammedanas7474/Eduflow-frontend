import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getStudentDashboard } from "../../api/auth.api";

// Icons
const Icons = {
  Courses: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Progress: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Complete: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Lesson: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
};

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getStudentDashboard();
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="text-emerald-500">{user?.full_name || "Student"}</span>!
        </h1>
        <p className="text-zinc-400">
          Continue your learning journey or explore new courses.
        </p>

        {/* Progress Overview */}
        {stats && (
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 bg-zinc-800/50 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.overall_progress}%` }}
              ></div>
            </div>
            <span className="text-emerald-500 font-bold text-lg">{stats.overall_progress}%</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Icons.Courses />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.courses_enrolled}</div>
            <div className="text-sm text-zinc-400">Courses Enrolled</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Icons.Progress />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.courses_in_progress}</div>
            <div className="text-sm text-zinc-400">In Progress</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Icons.Complete />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.courses_completed}</div>
            <div className="text-sm text-zinc-400">Completed</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Icons.Lesson />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.completed_lessons}/{stats.total_lessons}</div>
            <div className="text-sm text-zinc-400">Lessons Done</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/student/my-courses"
          className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Icons.Courses />
            </div>
            <span className="text-zinc-500 group-hover:text-emerald-500 transition-colors text-xl">→</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-500 transition-colors">
            My Courses
          </h2>
          <p className="text-zinc-400">
            Access your enrolled courses and continue learning.
          </p>
        </Link>

        <Link
          to="/student/enrollment-requests"
          className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors text-blue-500">
              <Icons.Courses />
            </div>
            <span className="text-zinc-500 group-hover:text-blue-500 transition-colors text-xl">→</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-500 transition-colors">
            Browse Courses
          </h2>
          <p className="text-zinc-400">
            Explore new courses and request enrollment.
          </p>
        </Link>
      </div>

      {/* Pending Requests Notice */}
      {stats && stats.pending_requests > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Icons.Clock />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">
              You have {stats.pending_requests} pending enrollment request{stats.pending_requests > 1 ? 's' : ''}
            </p>
            <p className="text-zinc-400 text-sm">Waiting for admin or instructor approval</p>
          </div>
        </div>
      )}
    </div>
  );
}
