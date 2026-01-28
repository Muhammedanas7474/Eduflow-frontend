import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/instructor/Sidebar";

export default function InstructorLayout() {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <div className="flex flex-1 pt-20">
                <Sidebar />
                <div className="flex-1 ml-64 p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
