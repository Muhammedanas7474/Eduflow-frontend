import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.full_name || "Student"}!
        </h1>
        <p className="text-zinc-400">
          Continue your learning journey or explore new courses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Courses Card */}
        <Link
          to="/student/my-courses"
          className="group block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="text-zinc-500 group-hover:text-emerald-500 transition-colors">
              →
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">My Courses</h2>
          <p className="text-zinc-400">
            Access your enrolled courses and continue learning.
          </p>
        </Link>

        {/* Enrollment Requests Card */}
        <Link
          to="/student/enrollment-requests"
          className="group block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-zinc-500 group-hover:text-blue-500 transition-colors">
              →
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Browse Courses
          </h2>
          <p className="text-zinc-400">
            Explore new courses and request enrollment.
          </p>
        </Link>
      </div>
    </div>
  );
}
