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
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import InstructorCourses from "../pages/instructor/InstructorCourses";
import InstructorEnrollments from "../pages/instructor/InstructorEnrollments";
import CourseDetail from "../pages/instructor/CourseDetail";
import CreateCourse from "../pages/instructor/CreateCourse";
import StudentDashboard from "../pages/student/StudentDashboard";
import MyCourses from "../pages/student/MyCourses";
import EnrollmentRequests from "../pages/student/EnrollmentRequests";
import StudentCoursePlayer from "../pages/student/StudentCoursePlayer";
import CourseEnrollments from "../pages/instructor/CourseEnrollments";
import CourseProgress from "../pages/instructor/CourseProgress";
import ComingSoon from "../components/ComingSoon";
import SettingsPage from "../pages/SettingsPage";
import ChatPage from "../pages/dashboard/ChatPage";
import QuizView from "../pages/quiz/QuizView";

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
        <Route path="/admin/analytics" element={<ComingSoon title="Analytics" backPath="/admin" />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/chat" element={<ChatPage />} />
      </Route>

      {/* ===== INSTRUCTOR ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/courses" element={<InstructorCourses />} />
        <Route path="/instructor/courses/new" element={<CreateCourse />} />
        <Route path="/instructor/courses/:id" element={<CourseDetail />} />
        <Route path="/instructor/courses/:id/enrollments" element={<CourseEnrollments />} />
        <Route path="/instructor/courses/:id/progress" element={<CourseProgress />} />
        <Route path="/instructor/courses/:id/quiz/:quizId" element={<QuizView />} />
        <Route path="/instructor/enrollments" element={<InstructorEnrollments />} />
        <Route path="/instructor/analytics" element={<ComingSoon title="Analytics" backPath="/instructor/courses" />} />
        <Route path="/instructor/settings" element={<SettingsPage />} />
        <Route path="/instructor/chat" element={<ChatPage />} />
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
        <Route path="/student/courses/:id/quiz/:quizId" element={<QuizView />} />
        <Route path="/student/certificates" element={<ComingSoon title="Certificates" backPath="/student" />} />
        <Route path="/student/settings" element={<SettingsPage />} />
        <Route path="/student/chat" element={<ChatPage />} />
      </Route>

      {/* ===== CHAT REDIRECT ===== */}
      <Route path="/chat" element={<Navigate to="/student/chat" replace />} />
      {/* ===== CHAT (All authenticated users) ===== */}


      {/* ===== FALLBACK ===== */}
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes >
  );
}
