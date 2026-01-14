import { useEffect, useState } from "react";
import { getProfile } from "../api/auth.api";
import ProfileCard from "../components/ProfileCard";
import { logout } from "../utils/auth";

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data.data);
    });
  }, []);

  return (
    <div className="p-6">
      {profile && <ProfileCard profile={profile} />}

      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>

      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}
