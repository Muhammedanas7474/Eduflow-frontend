import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div>
      <Navbar />

      <section className="flex flex-col items-center justify-center text-center mt-20 px-6">
        <h2 className="text-4xl font-bold mb-4">
          Learn Anything with EduFlow
        </h2>

        <p className="text-gray-600 max-w-xl mb-8">
          A modern learning platform for students, instructors, and institutions.
        </p>

        <div className="space-x-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Login
          </Link>
        </div>
      </section>
    </div>
  );
}
