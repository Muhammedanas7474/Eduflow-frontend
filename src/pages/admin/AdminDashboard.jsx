import { Link } from "react-router-dom";
import { Card, Button } from "../../components/UIComponents";

export default function AdminDashboard() {
  return (
    <>
      <div>
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

            <Card title="Enrollments">
              <p className="text-gray-400 mb-6">
                Enroll students in courses.
              </p>
              <Link to="/admin/enrollments">
                <Button variant="outline">Manage Enrollments</Button>
              </Link>
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
