import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <div className="flex flex-1 pt-20">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto ml-64">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
