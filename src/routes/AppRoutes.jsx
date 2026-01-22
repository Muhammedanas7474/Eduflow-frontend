import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Unauthorized from "../pages/Unauthorized";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx"
import AdminUsers from "../pages/admin/AdminUsers";
import AdminModeration from "../pages/admin/AdminModeration";
import AdminEnrollment from "../pages/admin/AdminEnrollment";
import InstructorLayout from "../layouts/InstructorLayout";
import InstructorCourses from "../pages/instructor/InstructorCourses";
import CourseDetail from "../pages/instructor/CourseDetail";
import StudentDashboard from "../pages/student/StudentDashboard";
import MyCourses from "../pages/student/MyCourses";
import EnrollmentRequests from "../pages/student/EnrollmentRequests";
import StudentCoursePlayer from "../pages/student/StudentCoursePlayer";
import CourseEnrollments from "../pages/instructor/CourseEnrollments";
import CourseProgress from "../pages/instructor/CourseProgress";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== PUBLIC ===== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ===== ADMIN ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/enrollments" element={<AdminEnrollment />} />
      </Route>

      {/* ===== INSTRUCTOR ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/instructor" element={<Navigate to="/instructor/courses" replace />} />
        <Route path="/instructor/courses" element={<InstructorCourses />} />
        <Route path="/instructor/courses/:id" element={<CourseDetail />} />
        <Route path="/instructor/courses/:id/enrollments" element={<CourseEnrollments />} />
        <Route path="/instructor/courses/:id/progress" element={<CourseProgress />} />
      </Route>

      {/* ===== STUDENT ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/my-courses" element={<MyCourses />} />
        <Route path="/student/enrollment-requests" element={<EnrollmentRequests />} />
        <Route path="/student/courses/:id" element={<StudentCoursePlayer />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes >
  );
}
