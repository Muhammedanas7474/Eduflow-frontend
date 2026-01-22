import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-black text-white">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
