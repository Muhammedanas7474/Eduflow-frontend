import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PublicLayout() {
  const { isAuthenticated, role, status } = useSelector((state) => state.auth);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated && role) {
    const dashboardPath =
      role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/instructor" : "/student/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return (
    <>
      <Outlet />
    </>
  );
}
