import { logout } from "../utils/auth";

export default function AdminDashboard() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
