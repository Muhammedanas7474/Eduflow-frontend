import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { logoutUser } from "../../api/auth.api";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed:", error);
        }
        dispatch(logout());
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    const links = [
        { name: "Dashboard", path: "/admin" },
        { name: "Course Moderation", path: "/admin/moderation" },
        { name: "Enrollment Approvals", path: "/admin/enrollments" },
        { name: "User Management", path: "/admin/users" },
        { name: "Analytics", path: "/admin/analytics" },
        { name: "Chat", path: "/admin/chat", icon: "chat" },
        { name: "Settings", path: "/admin/settings" },
    ];

    return (
        <div className="w-64 bg-zinc-950 border-r border-zinc-900 h-[calc(100vh-5rem)] flex flex-col fixed left-0 top-20">
            {/* Logo removed - in Navbar */}

            <nav className="flex-1 p-4 space-y-2 mt-2">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                            ? "bg-neon/10 text-neon border border-neon/20"
                            : "text-gray-400 hover:text-white hover:bg-zinc-900"
                            }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-zinc-900">
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-md transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
