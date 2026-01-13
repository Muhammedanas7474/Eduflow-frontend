import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <h1 className="text-2xl font-bold text-blue-600">
        EduFlow
      </h1>

      <div className="space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 text-blue-600 font-medium hover:underline"
        >
          Login
        </Link>
        


        <Link
          to="/register"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}
