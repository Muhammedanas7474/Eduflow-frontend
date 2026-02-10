import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/auth.api";
import { Card, Input, Button } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone_number: "",
    password: "",
    tenant_id: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await loginUser(form);

      localStorage.setItem("phone", form.phone_number);
      localStorage.setItem("otp_purpose", "LOGIN");

      navigate("/verify");
    } catch (err) {
      console.error("Login Error:", err);
      const data = err?.response?.data;
      const msg = data?.message || data?.detail || "Login failed";
      alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <Card title="Welcome Back" className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <Input
              label="Phone Number"
              name="phone_number"
              placeholder="e.g. 9876543210"
              value={form.phone_number}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Tenant ID"
              name="tenant_id"
              placeholder="e.g. 1"
              value={form.tenant_id}
              onChange={handleChange}
              required
            />

            <div className="flex justify-end mb-6">
              <Link
                to="/forgot-password"
                className="text-sm text-neon hover:text-white transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" variant="primary">
              Login & Send OTP
            </Button>

            <p className="mt-6 text-center text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-neon hover:text-white font-bold transition-colors">
                Register
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </>
  );
}
