import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../store/slices/courseSlice";
import { fetchUsers } from "../../store/slices/adminSlice";

// Icons
const Icons = {
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    MoreVertical: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>,
    Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
};

export default function AdminModeration() {
    const dispatch = useDispatch();
    const { courses } = useSelector((state) => state.courses);
    const { users } = useSelector((state) => state.admin);
    const [activeTab, setActiveTab] = useState("All Courses");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourses, setSelectedCourses] = useState([]);

    useEffect(() => {
        dispatch(fetchCourses());
        dispatch(fetchUsers());
    }, [dispatch]);

    // Calculate real stats from courses data
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.is_active).length;
    const draftCourses = courses.filter(c => !c.is_active).length;

    // Derived Stats
    const stats = [
        {
            label: "Total Courses",
            value: totalCourses,
            icon: Icons.FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            iconColor: "text-blue-500"
        },
        {
            label: "Published",
            value: publishedCourses,
            icon: Icons.CheckCircle,
            color: "text-green-500",
            bg: "bg-green-500/10",
            iconColor: "text-green-500"
        },
        {
            label: "Drafts / Inactive",
            value: draftCourses,
            icon: Icons.AlertTriangle,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            iconColor: "text-yellow-500"
        }
    ];

    // Helper to get instructor name
    const getInstructorName = (instructorId) => {
        if (!instructorId) return "Unknown";
        const instructor = users.find(u => u.id === instructorId);
        return instructor ? (instructor.name || instructor.email || "Unknown") : "Unknown";
    };

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Published</span>;
        } else {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Draft</span>;
        }
    };

    // Filter logic
    const filteredCourses = courses.filter(course => {
        const matchesTab = activeTab === "All Courses" ||
            (activeTab === "Published" && course.is_active) ||
            (activeTab === "Drafts" && !course.is_active);

        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getInstructorName(course.instructor).toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const toggleSelection = (id) => {
        if (selectedCourses.includes(id)) {
            setSelectedCourses(selectedCourses.filter(cId => cId !== id));
        } else {
            setSelectedCourses([...selectedCourses, id]);
        }
    };

    // Define Tabs dynamically with counts
    const tabs = [
        { name: "All Courses", count: totalCourses },
        { name: "Published", count: publishedCourses },
        { name: "Drafts", count: draftCourses }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Moderation</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Course Moderation</h1>
                    <p className="text-gray-400">Review and manage course submissions across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors">
                        <Icons.Download />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-zinc-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`pb-4 px-2 text-sm font-medium transition-all relative flex items-center gap-2 ${activeTab === tab.name ? "text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        {tab.name}
                        <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${activeTab === tab.name ? "bg-zinc-800 text-white" : "bg-zinc-900/50 text-zinc-500"}`}>
                            {tab.count}
                        </span>
                        {activeTab === tab.name && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00cc7d] shadow-[0_0_10px_rgba(0,255,157,0.5)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Icons.Search />
                </div>
                <input
                    type="text"
                    placeholder="Search courses or instructors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-[#00cc7d] focus:ring-1 focus:ring-[#00cc7d]/50 placeholder-zinc-600 transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-zinc-700 bg-zinc-800 text-[#00cc7d] focus:ring-[#00cc7d]"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCourses(filteredCourses.map(c => c.id));
                                        } else {
                                            setSelectedCourses([]);
                                        }
                                    }}
                                    checked={filteredCourses.length > 0 && selectedCourses.length === filteredCourses.length}
                                />
                            </th>
                            <th className="p-4">Course Details</th>
                            <th className="p-4">Instructor</th>
                            <th className="p-4">Last Updated</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-zinc-900/50 transition-colors group">
                                    <td className="p-4 align-top pt-6">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => toggleSelection(course.id)}
                                            className="rounded border-zinc-700 bg-zinc-800 text-[#00cc7d] focus:ring-[#00cc7d]"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-4">
                                            <div className="w-24 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                        <span className="text-xs">No Img</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-[#00cc7d] transition-colors line-clamp-1">{course.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{course.lessons?.length || 0} Lessons • {course.duration || "--"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top pt-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                                                {getInstructorName(course.instructor).charAt(0)}
                                            </div>
                                            <span className="text-sm text-gray-300">{getInstructorName(course.instructor)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top pt-6 text-sm text-gray-400">
                                        {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : "--"}
                                    </td>
                                    <td className="p-4 align-top pt-6">
                                        {getStatusBadge(course.is_active)}
                                    </td>
                                    <td className="p-4 align-top pt-6 text-right">
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <Icons.MoreVertical />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No courses found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Mock (Still needed as backend doesn't support pagination metadata yet?) 
                Actually the user said "real data fetch". If the fetch returns all, client-side pagination is fine or just listing all.
                I will leave it simple: "Showing X courses".
            */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Total {filteredCourses.length} courses</span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                            <stat.icon />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
