import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/student/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <div className="flex-1 ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
}
