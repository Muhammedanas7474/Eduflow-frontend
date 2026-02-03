import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { logoutUser } from "../api/auth.api";
import { Button } from "./UIComponents";
import NotificationBell from "./common/NotificationBell";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const isAuthPage = ["/login", "/register", "/verify", "/forgot-password", "/reset-password"].includes(location.pathname);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-neon flex items-center justify-center font-bold text-black text-xl group-hover:shadow-[0_0_15px_rgba(0,255,157,0.6)] transition-all">
            E
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Edu<span className="text-neon">Flow</span>
          </span>
        </Link>

        {!isAuthPage && (
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link to="/chat">
                  <Button variant="ghost" className="!w-auto !py-2 !px-6 text-neon border-neon hover:bg-neon/10">💬 Chat</Button>
                </Link>
                <Link to={role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/instructor" : "/student"}>
                  <Button variant="ghost" className="!w-auto !py-2 !px-6">Dashboard</Button>
                </Link>
                <Button
                  variant="primary"
                  className="!w-auto !py-2 !px-6 shadow-neon"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="!w-auto !py-2 !px-6">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="!w-auto !py-2 !px-6 shadow-neon">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
