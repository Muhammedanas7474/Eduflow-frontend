import { useEffect, useState } from "react";
import { getProfile } from "../../api/auth.api";
import { logout } from "../../utils/auth";
import { Card, Button } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data.data);
    });
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Student <span className="text-neon">Dashboard</span>
            </h1>
            <Button variant="danger" onClick={logout} className="!w-auto !py-2 !px-6">
              Logout
            </Button>
          </div>

          <div className="grid gap-6">
            {profile && (
              <Card title="My Profile">
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
                    <span className="text-gray-400">Tenant</span>
                    <span className="text-neon font-bold">{profile.tenant || "N/A"}</span>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Enrolled Courses">
                <p className="text-gray-400 mb-6">Access your learning materials.</p>
                <Button variant="outline">Go to Courses</Button>
              </Card>
              <Card title="Certificates">
                <p className="text-gray-400 mb-6">View your earned certificates.</p>
                <Button variant="ghost" disabled>Coming Soon</Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
