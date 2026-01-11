import { logout } from "../utils/auth";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Admin Dashboard</h2>
        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
