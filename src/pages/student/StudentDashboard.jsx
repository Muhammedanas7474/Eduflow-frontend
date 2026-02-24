import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getStudentDashboard } from "../../api/auth.api";
import { fetchMyEnrollments } from "../../store/slices/enrollmentSlice";

// Icons
const Icons = {
  Courses: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Progress: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Complete: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Lesson: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Play: () => <svg className="w-5 h-5 pl-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Search: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
};

// Tool: Generate consistent vibrant fallback linear gradients mapping to the course title string characters
const generateGradientFallback = (title) => {
  const defaultTitle = title || "Course";
  let hash = 0;
  for (let i = 0; i < defaultTitle.length; i++) {
    hash = defaultTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = hash % 360;
  const hue2 = (hash * 2) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 30%), hsl(${hue2}, 60%, 20%))`;
};

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { myEnrollments = [] } = useSelector((state) => state.enrollments);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats dynamically
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

    // Fetch active enrollments dynamically
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  // Find the most recently active or active continuing course
  const activeCourse = myEnrollments.find(e => e.progress_percentage > 0 && e.progress_percentage < 100)
    || myEnrollments[0];

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto pb-10">

      {/* Dynamic Welcome Hero - Fluid Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#183424] to-[#11241a] border border-emerald-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-emerald-900/10">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <svg className="w-64 h-64 text-emerald-400 transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{user?.full_name || "Student"}</span>
            </h1>
            <p className="text-emerald-100/60 text-lg max-w-xl">
              You're making great progress! Continue your learning journey or explore new subjects today.
            </p>
          </div>

          {/* Dynamic Overall Progress Widget */}
          {stats && (
            <div className="w-full md:w-72 bg-[#11241a]/60 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 shadow-inner">
              <div className="flex justify-between items-end mb-3">
                <span className="text-emerald-100/70 font-medium">Overall Progress</span>
                <span className="text-emerald-400 font-bold text-3xl">{stats.overall_progress}%</span>
              </div>
              <div className="h-3 bg-[#0a1610] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  style={{ width: `${stats.overall_progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-[#183424] rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-[#183424] rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Enrolled */}
          <div className="group bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                <Icons.Courses />
              </div>
              <div className="text-sm font-medium text-emerald-100/50 uppercase tracking-wider">Enrolled</div>
            </div>
            <div className="text-4xl font-extrabold text-white">{stats.courses_enrolled}</div>
          </div>

          {/* In Progress */}
          <div className="group bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-900/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 group-hover:bg-yellow-500/20 transition-all">
                <Icons.Progress />
              </div>
              <div className="text-sm font-medium text-emerald-100/50 uppercase tracking-wider">In Progress</div>
            </div>
            <div className="text-4xl font-extrabold text-white">{stats.courses_in_progress}</div>
          </div>

          {/* Completed Courses */}
          <div className="group bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                <Icons.Complete />
              </div>
              <div className="text-sm font-medium text-emerald-100/50 uppercase tracking-wider">Completed</div>
            </div>
            <div className="text-4xl font-extrabold text-white">{stats.courses_completed}</div>
          </div>

          {/* Lessons Done */}
          <div className="group bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                <Icons.Lesson />
              </div>
              <div className="text-sm font-medium text-emerald-100/50 uppercase tracking-wider">Lessons Done</div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-extrabold text-white">{stats.completed_lessons}</div>
              <div className="text-xl font-medium text-emerald-100/40">/ {stats.total_lessons}</div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Actions & Course Resume Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

        {/* Dynamic "Jump Back In" Widget (takes 2 columns on large screens) */}
        <div className="lg:col-span-2 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-6">Jump Back In</h2>
          {activeCourse ? (
            <div className="relative flex flex-col md:flex-row bg-[#11241a] border border-[#2d5740]/40 rounded-3xl overflow-hidden shadow-2xl group hover:border-emerald-500/40 transition-all duration-300">

              {/* Dynamic Course Cover */}
              <div className="w-full md:w-2/5 h-48 md:h-auto relative" style={{ background: generateGradientFallback(activeCourse.course_title) }}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              {/* Dynamic Course Info */}
              <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 uppercase tracking-wide">
                      {activeCourse.progress_percentage === 100 ? "Completed" : "Active"}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 line-clamp-1">{activeCourse.course_title}</h3>
                  <p className="text-emerald-100/60 line-clamp-2 mb-8">
                    {activeCourse.course_description || "Pick up exactly where you left off and hit your weekly learning goals."}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-emerald-100/50 font-medium">Course Progress</span>
                    <span className="text-lg font-bold text-emerald-400">{activeCourse.progress_percentage || 0}%</span>
                  </div>
                  <div className="h-2.5 bg-[#0a1610] rounded-full overflow-hidden shadow-inner mb-6">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-600 to-emerald-400"
                      style={{ width: `${activeCourse.progress_percentage || 0}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => navigate(`/student/courses/${activeCourse.course}`)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-600/25 transform hover:-translate-y-0.5"
                  >
                    <Icons.Play />
                    {activeCourse.progress_percentage === 100 ? "Review Material" : "Continue Learning"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-[#11241a] border border-[#2d5740]/40 rounded-3xl h-full text-center">
              <div className="w-20 h-20 mb-6 rounded-full bg-[#183424] flex items-center justify-center text-emerald-500/50">
                <Icons.Lesson />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Start Learning?</h3>
              <p className="text-emerald-100/50 mb-6 max-w-sm">You haven't enrolled in any courses yet. Browse our catalog to find your first course!</p>
              <Link to="/student/enrollment-requests" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg">
                Explore Courses
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="flex flex-col gap-4 h-full">

            <Link
              to="/student/courses"
              className="flex-1 group bg-[#183424]/60 border border-emerald-500/20 rounded-3xl p-8 hover:border-emerald-500/50 hover:bg-[#183424] transition-all flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500 text-emerald-500">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Icons.Courses />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">My Library</h3>
                <p className="text-emerald-100/60 leading-relaxed font-medium">View and jump into all your active and completed courses.</p>
              </div>
            </Link>

            <Link
              to="/student/enrollment-requests"
              className="flex-1 group bg-[#11241a] border border-[#2d5740]/40 rounded-3xl p-8 hover:border-blue-500/40 hover:bg-[#11241a]/80 transition-all flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500 text-blue-500">
                <Icons.Search />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-blue-500/20 group-hover:scale-110 transition-transform">
                  <Icons.Search />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Browse Catalog</h3>
                <p className="text-emerald-100/50 leading-relaxed font-medium">Search for new subjects and expand your skillset.</p>
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* Dynamic Pending Requests Notification */}
      {stats && stats.pending_requests > 0 && (
        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 animate-pulse">
              <Icons.Clock />
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                Pending Enrollments
              </p>
              <p className="text-emerald-100/60 font-medium tracking-wide">
                You have <span className="text-yellow-400 font-bold">{stats.pending_requests}</span> request{stats.pending_requests > 1 ? 's' : ''} waiting for approval.
              </p>
            </div>
          </div>
          <Link to="/student/enrollment-requests" className="px-6 py-2 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors font-bold w-full sm:w-auto text-center">
            View Status
          </Link>
        </div>
      )}
    </div>
  );
}
