import { Link } from "react-router-dom";
import { Card, Button } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Admin <span className="text-neon">Dashboard</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="User Management">
              <p className="text-gray-400 mb-6">
                Manage students, instructors, and system administrators.
              </p>
              <Link to="/admin/users">
                <Button variant="outline">Manage Users</Button>
              </Link>
            </Card>

            <Card title="System Settings">
              <p className="text-gray-400 mb-6">
                Configure tenant settings and global preferences.
              </p>
              <Button variant="ghost" disabled>Coming Soon</Button>
            </Card>

            <Card title="Analytics">
              <p className="text-gray-400 mb-6">
                View platform usage and engagement statistics.
              </p>
              <Button variant="ghost" disabled>Coming Soon</Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
