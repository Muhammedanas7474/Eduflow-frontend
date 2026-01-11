import { logout } from "../utils/auth";

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h2 className="mb-2 text-2xl font-semibold text-slate-800">
          Instructor Dashboard
        </h2>

        <p className="mb-6 text-slate-600">
          Manage courses, lessons, and student progress.
        </p>

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
