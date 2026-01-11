import { useEffect } from "react";
import { loginUser } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const phone = localStorage.getItem("phone");

  useEffect(() => {
    if (!phone) navigate("/");
  }, [phone, navigate]);

  const handleLogin = async () => {
    try {
      const res = await loginUser({ phone_number: phone });
      const { access, refresh, role } = res.data.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      if (role === "ADMIN") navigate("/admin");
      else if (role === "INSTRUCTOR") navigate("/instructor");
      else navigate("/student");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <AuthLayout title="Login">
      <p className="mb-4 text-center text-slate-600">
        Phone verified successfully
      </p>

      <button
        onClick={handleLogin}
        className="w-full rounded-lg bg-black py-2 text-white hover:bg-slate-800"
      >
        Continue
      </button>
    </AuthLayout>
  );
}
