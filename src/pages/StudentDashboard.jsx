import { logout } from "../utils/auth";

export default function StudentDashboard() {
  return (
    <div>
      <h2>Student Dashboard</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
