import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCourses } from "../../store/slices/courseSlice";

// Icons
const Icons = {
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Filter: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    MoreVertical: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>,
    Sort: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
};

export default function InstructorCourses() {
    const dispatch = useDispatch();
    const { courses } = useSelector((state) => state.courses);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All Courses");

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    // Filtering Logic - now the backend already filters to only show instructor's courses
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab =
            activeTab === "All Courses" ? true :
                activeTab === "Approved" ? course.is_approved :
                    activeTab === "Pending Approval" ? !course.is_approved : true;

        return matchesSearch && matchesTab;
    });

    // Counts for Tabs
    const approvedCount = courses.filter(c => c.is_approved).length;
    const pendingCount = courses.filter(c => !c.is_approved).length;
    const allCount = courses.length;

    const tabs = [
        { name: "All Courses", count: allCount },
        { name: "Approved", count: approvedCount },
        { name: "Pending Approval", count: pendingCount },
    ];

    // Get approval status badge
    const getApprovalBadge = (isApproved) => {
        if (isApproved) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Icons.CheckCircle />
                    Approved
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    <Icons.Clock />
                    Pending
                </span>
            );
        }
    };

    return (
        <div className="space-y-8">
            {/* Info Banner for Pending Courses */}
            {pendingCount > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-yellow-500 mt-0.5">
                            <Icons.Clock />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-yellow-500">Courses Pending Approval</h3>
                            <p className="text-xs text-yellow-500/80 mt-1">
                                You have {pendingCount} course(s) waiting for admin approval. Students cannot see these courses until they are approved.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="relative w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Icons.Search />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#00cc7d] focus:ring-1 focus:ring-[#00cc7d]/50 transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon rounded-full"></span>
                    </button>
                    <Link to="/instructor/courses/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#00cc7d] text-black font-bold rounded-lg hover:bg-[#00b36e] transition-colors shadow-[0_0_15px_rgba(0,255,157,0.3)] text-sm">
                        <Icons.Plus />
                        New Course
                    </Link>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 min-h-[600px]">
                {/* Tabs & Filters */}
                <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-2">
                    <div className="flex gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${activeTab === tab.name ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {tab.name}
                                <span className="text-xs text-zinc-600">({tab.count})</span>
                                {activeTab === tab.name && (
                                    <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#00cc7d] shadow-[0_0_10px_rgba(0,255,157,0.5)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 mb-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
                            <Icons.Filter />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
                            <Icons.Sort />
                            Latest First
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-zinc-900">
                                <th className="py-4 pl-4">Course Name</th>
                                <th className="py-4">Approval</th>
                                <th className="py-4">Status</th>
                                <th className="py-4">Lessons</th>
                                <th className="py-4">Last Updated</th>
                                <th className="py-4 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="group hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-10 bg-zinc-800 rounded overflow-hidden flex-shrink-0 relative group-hover:ring-1 ring-neon/50 transition-all">
                                                    {course.thumbnail ? (
                                                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><image x="1" y="1" width="22" height="22"></image></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white group-hover:text-neon transition-colors">{course.title}</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]">{course.description || "No description"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            {getApprovalBadge(course.is_approved)}
                                        </td>
                                        <td className="py-4">
                                            {course.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4">
                                            <span className="text-sm font-medium text-white">{course.lessons?.length || 0}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-sm font-medium text-white">
                                                {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : "--"}
                                            </span>
                                            <div className="text-[10px] text-gray-600">
                                                {course.updated_at ? new Date(course.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/instructor/courses/${course.id}`}>
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00cc7d]/10 text-[#00cc7d] rounded-md text-xs font-bold hover:bg-[#00cc7d] hover:text-black transition-all">
                                                        <Icons.Edit />
                                                        Edit
                                                    </button>
                                                </Link>
                                                <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                                    <Icons.MoreVertical />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                                                <Icons.Search />
                                            </div>
                                            <p className="text-sm">No courses found with these filters.</p>
                                            {allCount === 0 && (
                                                <Link to="/instructor/courses/new" className="mt-4 text-[#00cc7d] hover:underline text-sm">
                                                    Create your first course →
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
