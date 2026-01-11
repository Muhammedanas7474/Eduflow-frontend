import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "../utils/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(getRole())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
