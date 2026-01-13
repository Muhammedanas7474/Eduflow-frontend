import { BrowserRouter, Routes, Route } from "react-router-dom";

import SendOTP from "../pages/SendOTP";
import VerifyOTP from "../pages/VerifyOTP";

import AdminDashboard from "../pages/AdminDashboard.jsx";
import AdminUsers from "../pages/admin/AdminUsers";

import InstructorDashboard from "../pages/InstructorDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import Unauthorized from "../pages/Unauthorized";

import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";

export default function AppRoutes() {
  return (
    
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/login" element={<Login/>} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Instructor routes */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    
  );
}
