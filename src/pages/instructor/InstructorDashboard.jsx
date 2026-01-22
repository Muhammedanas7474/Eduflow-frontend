import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchUserProfile, logout } from "../../store/slices/authSlice";
import { Card, Button } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function InstructorDashboard() {
  const dispatch = useDispatch();
  const { user: profile } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Instructor <span className="text-neon">Portal</span>
            </h1>
            <Button variant="danger" onClick={() => dispatch(logout())} className="!w-auto !py-2 !px-6">
              Logout
            </Button>
          </div>

          <div className="grid gap-6">
            {profile && (
              <Card title="Instructor Profile">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-gray-400">Name</span>
                    <span className="text-white font-medium">{profile.full_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white font-medium">{profile.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-gray-400">Phone</span>
                    <span className="text-white font-medium">{profile.phone_number}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-400">Role</span>
                    <span className="text-neon font-bold">{profile.role}</span>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="My Courses">
                <p className="text-gray-400 mb-6">Manage your courses and content.</p>
                <Link to="/instructor/courses">
                  <Button variant="outline">View Courses</Button>
                </Link>
              </Card>
              <Card title="Student Progress">
                <p className="text-gray-400 mb-6">Track student performance.</p>
                <Button variant="ghost" disabled>Coming Soon</Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
