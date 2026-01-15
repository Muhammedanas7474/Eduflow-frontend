import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Unauthorized from "../pages/Unauthorized";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx"
import AdminUsers from "../pages/admin/AdminUsers";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";

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
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      {/* ===== INSTRUCTOR ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/instructor" element={<InstructorDashboard />} />
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
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}
