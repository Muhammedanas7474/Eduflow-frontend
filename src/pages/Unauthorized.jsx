import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="rounded-xl bg-white p-6 text-center shadow">
        <h2 className="mb-2 text-2xl font-semibold text-red-600">
          403 – Unauthorized
        </h2>

        <p className="mb-4 text-slate-600">
          You do not have permission to access this page.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
