import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstructorDashboard } from "../../api/auth.api";
import {
    Users,
    BookOpen,
    Activity,
    Clock,
    TrendingUp,
    Award,
    ChevronRight
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#11241a] border border-[#2d5740] rounded-xl p-3 shadow-2xl">
                <p className="text-emerald-100/60 text-xs font-semibold mb-1 uppercase tracking-wider">{label}</p>
                <p className="text-emerald-400 font-bold text-lg">
                    {payload[0].value} <span className="text-sm font-medium text-emerald-100/50">Students</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function InstructorDashboard() {
    const [stats, setStats] = useState(null);
    const [topCourses, setTopCourses] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getInstructorDashboard();
                const data = response.data?.data || response.data;
                setStats(data.stats);
                setTopCourses(data.top_courses || []);
                setRecentActivity(data.recent_activity || []);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Format chart data
    const chartData = topCourses.map(course => ({
        name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
        students: course.student_count
    }));

    const statTiles = stats ? [
        {
            label: "Total Students",
            value: stats.total_students,
            icon: <Users className="w-5 h-5 text-emerald-400" />,
            color: "from-emerald-500/20 to-emerald-900/10",
            border: "border-emerald-500/30"
        },
        {
            label: "Active Courses",
            value: `${stats.active_courses} / ${stats.total_courses}`,
            icon: <BookOpen className="w-5 h-5 text-blue-400" />,
            color: "from-blue-500/20 to-blue-900/10",
            border: "border-blue-500/30"
        },
        {
            label: "Avg Completion",
            value: `${stats.avg_completion_rate}%`,
            icon: <Activity className="w-5 h-5 text-purple-400" />,
            color: "from-purple-500/20 to-purple-900/10",
            border: "border-purple-500/30"
        },
        {
            label: "Pending Requests",
            value: stats.pending_enrollments,
            icon: <Clock className="w-5 h-5 text-amber-400" />,
            color: "from-amber-500/20 to-amber-900/10",
            border: "border-amber-500/30"
        },
    ] : [];

    return (
        <div className="w-full max-w-[1400px] mx-auto pb-12 flex flex-col gap-8 font-sans">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">Dashboard Overview</h1>
                    <p className="text-emerald-100/50 font-medium">Welcome back! Here's your curriculum's latest activity.</p>
                </div>
                <Link to="/instructor/courses" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2 max-w-max">
                    Create Course <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {loading && (
                <div className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-t-2 border-l-2 border-emerald-500 animate-spin"></div>
                        <div className="text-emerald-500 font-bold uppercase tracking-widest text-sm">Loading Data...</div>
                    </div>
                </div>
            )}

            {/* Hero Stats Row */}
            {!loading && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statTiles.map((stat, idx) => (
                        <div
                            key={idx}
                            className={`bg-gradient-to-br ${stat.color} bg-[#11241a] border ${stat.border} rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
                        >
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-sm font-semibold text-emerald-100/70 uppercase tracking-wider">{stat.label}</div>
                                <div className="p-2 bg-black/40 rounded-lg backdrop-blur-sm">
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="text-4xl font-extrabold text-white tracking-tight relative z-10">{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Two Column Layout: Chart & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart Area (Left 2 Col) */}
                <div className="lg:col-span-2 bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 shadow-xl min-h-[420px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50"></div>
                    <div className="flex justify-between items-start mb-8 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Course Performance
                            </h2>
                            <p className="text-sm text-emerald-100/50 font-medium mt-1">Student enrollment across your curriculum</p>
                        </div>
                    </div>

                    {/* Recharts Area Chart */}
                    <div className="flex-grow w-full h-full min-h-[300px] z-10">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d5740" vertical={false} opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#a7f3d0"
                                        opacity={0.5}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#a7f3d0"
                                        opacity={0.5}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="students"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorStudents)"
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-40">
                                <TrendingUp className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
                                <p className="text-emerald-100 font-medium pb-10">Create a course and enroll students to view metrics here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Feed (Right 1 Col) */}
                <div className="bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 shadow-xl flex flex-col min-h-[420px] max-h-[420px]">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Recent Activity
                    </h2>

                    <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                        {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                            <div key={activity.id} className="flex gap-4 group p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-black/40 border border-[#2d5740]/50 shadow-inner`}>
                                    {idx % 3 === 0 ? <Users className="w-4 h-4 text-emerald-400" /> :
                                        idx % 3 === 1 ? <BookOpen className="w-4 h-4 text-blue-400" /> :
                                            <Award className="w-4 h-4 text-purple-400" />}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-sm text-emerald-50 leading-snug">
                                        <span className="font-bold text-white">{activity.user_name}</span> {activity.message}
                                    </p>
                                    <p className="text-xs text-emerald-100/40 font-medium mt-1">{activity.time_ago}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-40 pb-10">
                                <Clock className="w-10 h-10 text-emerald-500 mb-3 opacity-50" />
                                <span className="text-sm text-emerald-100 font-medium">No recent activity detected.</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Top Performing Courses Cards */}
            {!loading && topCourses.length > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            Top Courses Dashboard
                        </h2>
                        <Link to="/instructor/courses" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topCourses.map((course, idx) => {
                            const colors = [
                                "from-emerald-900/40 via-[#11241a] to-[#11241a] border-emerald-500/30",
                                "from-blue-900/40 via-[#11241a] to-[#11241a] border-blue-500/30",
                                "from-purple-900/40 via-[#11241a] to-[#11241a] border-purple-500/30",
                                "from-amber-900/40 via-[#11241a] to-[#11241a] border-amber-500/30",
                                "from-rose-900/40 via-[#11241a] to-[#11241a] border-rose-500/30",
                                "from-cyan-900/40 via-[#11241a] to-[#11241a] border-cyan-500/30"
                            ];
                            const colorClass = colors[idx % colors.length];

                            return (
                                <Link
                                    key={course.id}
                                    to={`/instructor/courses/${course.id}`}
                                    className={`h-32 bg-gradient-to-br ${colorClass} bg-[#11241a] border rounded-2xl p-5 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] transition-all duration-300 relative overflow-hidden group flex flex-col justify-between`}
                                >
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                                    <div className="z-10 flex justify-between items-start">
                                        <h3 className="text-white font-bold text-lg leading-tight w-[75%] line-clamp-2">{course.title}</h3>
                                        <div className="bg-black/40 px-2 py-1 rounded text-xs font-bold text-white/70">
                                            #{idx + 1}
                                        </div>
                                    </div>

                                    <div className="z-10 flex justify-between items-end w-full">
                                        <div className="flex items-center gap-1.5 text-emerald-100/60 text-sm font-medium">
                                            <Users className="w-4 h-4" /> {course.student_count} Students
                                        </div>
                                        <div className="text-xs font-bold text-white/30 group-hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1">
                                            Manage <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}
