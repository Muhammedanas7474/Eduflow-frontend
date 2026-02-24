import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCourses } from "../../store/slices/courseSlice";

// Icons
const Icons = {
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
};

export default function InstructorCourses() {
    const dispatch = useDispatch();
    const { courses } = useSelector((state) => state.courses);
    const [searchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All Courses");

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    // Filtering Logic based on screenshot tabs
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab =
            activeTab === "All Courses" ? true :
            activeTab === "Published" ? course.is_active :
            activeTab === "Draft" ? !course.is_active :
            activeTab === "Archived" ? false : true; // Assuming no actual archive logic yet based on DB

        return matchesSearch && matchesTab;
    });

    const formatTimeAgo = (dateString) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays === 1) return "Updated 1 day ago";
        if (diffDays < 7) return `Updated ${diffDays} days ago`;
        const diffWeeks = Math.ceil(diffDays / 7);
        if (diffWeeks === 1) return "Updated 1 week ago";
        return `Updated ${diffWeeks} weeks ago`;
    };

    const tabs = [
        { name: "All Courses", count: courses.length },
        { name: "Published", count: courses.filter(c => c.is_active).length },
        { name: "Draft", count: courses.filter(c => !c.is_active).length },
        { name: "Archived", count: 0 },
    ];

    // Placeholder gradient mapping based on theme string or deterministic fallback
    const getBgGradient = (theme) => {
        const themes = {
            blue: "from-blue-600 to-cyan-500",
            purple: "from-purple-600 to-indigo-500",
            orange: "from-orange-500 to-amber-400",
            green: "from-emerald-500 to-teal-400",
            red: "from-rose-500 to-pink-500",
            dark: "from-zinc-800 to-zinc-900"
        };
        return themes[theme] || "from-[#183424] to-[#0a1610]";
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto pb-16 font-sans">
            
            {/* Header matching the design */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">My Courses</h1>
                    <p className="text-emerald-100/60 font-medium">Manage and monitor your {courses.length} active instructor modules</p>
                </div>
                {/* View Toggles Placeholder */}
                <div className="flex bg-[#183424] border border-[#2d5740]/40 rounded-lg p-1 w-full md:w-auto">
                    <button className="flex-1 md:w-28 py-1.5 text-xs font-bold rounded bg-[#2d5740]/60 text-white shadow">Grid View</button>
                    <button className="flex-1 md:w-28 py-1.5 text-xs font-bold rounded text-emerald-100/50 hover:text-emerald-100/80 transition-colors">List View</button>
                </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex items-center gap-8 border-b border-[#2d5740]/30 mb-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`pb-4 text-[13px] font-bold transition-all relative flex items-center gap-2 whitespace-nowrap ${
                            activeTab === tab.name ? "text-emerald-400" : "text-emerald-100/60 hover:text-white"
                        }`}
                    >
                        {tab.name}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.name ? 'bg-emerald-500/20' : 'bg-[#183424]'}`}>
                            {tab.count}
                        </span>
                        {activeTab === tab.name && (
                            <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Create New Course Tile */}
                <Link to="/instructor/courses/new" className="group h-[380px] bg-transparent border-2 border-dashed border-[#2d5740] rounded-2xl flex flex-col items-center justify-center hover:bg-[#183424]/30 hover:border-emerald-500/50 transition-all cursor-pointer">
                    <div className="w-14 h-14 rounded-full bg-[#183424] border border-[#2d5740]/50 flex items-center justify-center text-emerald-100/40 group-hover:text-emerald-400 group-hover:bg-[#11241a] group-hover:scale-110 transition-all mb-4">
                        <Icons.Plus />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">Create Course</h3>
                    <p className="text-emerald-100/50 text-xs w-[70%] text-center leading-relaxed">Launch a new learning module for your students</p>
                </Link>

                {/* Course Tiles */}
                {filteredCourses.map((course) => (
                    <div key={course.id} className="h-[380px] bg-[#11241a] border border-[#2d5740]/40 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all group">
                        
                        {/* Course Thumbnail / Banner */}
                        <div className={`h-[160px] relative bg-gradient-to-br ${getBgGradient(course.cover_theme)}`}>
                            {/* Optional: Add abstract shape overlays if no image */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
                            
                            {/* Status Badge inside banner */}
                            <div className="absolute top-4 left-4">
                                {course.is_active ? (
                                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-black shadow-lg rounded">
                                        Published
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-orange-400 text-black shadow-lg rounded">
                                        Draft
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Card Content Base */}
                        <div className="p-6 flex-grow flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2">{course.title}</h3>
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100/50 font-medium">
                                    <Icons.Clock />
                                    {formatTimeAgo(course.updated_at)}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-6">
                                <div>
                                    <div className="text-xl font-black text-white">{course.student_count || 0}</div>
                                    <div className="text-[9px] font-bold text-emerald-100/40 uppercase tracking-widest mt-0.5">Students</div>
                                </div>
                                <Link to={`/instructor/courses/${course.id}`} className="px-5 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500 transition-colors">
                                    Manage
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* Pagination / Footer Placeholder */}
            {filteredCourses.length > 0 && (
                <div className="flex items-center justify-between mt-12 py-6 border-t border-[#2d5740]/30">
                    <div className="text-sm font-medium text-emerald-100/60">
                        Showing <span className="font-bold text-white">1 to {filteredCourses.length}</span> of <span className="font-bold text-white">{courses.length}</span> courses
                    </div>
                    {/* Placeholder Pagination */}
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2d5740]/40 text-emerald-100/50 hover:text-white">&lsaquo;</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-emerald-500 text-black font-bold">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2d5740]/40 text-emerald-100/50 hover:text-white">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2d5740]/40 text-emerald-100/50 hover:text-white">&rsaquo;</button>
                    </div>
                </div>
            )}
        </div>
    );
}
