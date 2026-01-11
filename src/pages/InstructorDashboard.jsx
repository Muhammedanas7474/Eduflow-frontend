import { logout } from "../utils/auth";

export default function InstructorDashboard() {
  return (
    <div>
      <h2>Instructor Dashboard</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
