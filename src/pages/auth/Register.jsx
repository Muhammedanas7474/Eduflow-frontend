import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import { Card, Input, Button, Select } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenant_id: "",
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      localStorage.setItem("phone", form.phone_number);
      localStorage.setItem("otp_purpose", "REGISTER");
      navigate("/verify");
    } catch (err) {
      alert(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <Card title="Create Account" className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <Select
              label="Select Tenant"
              name="tenant_id"
              value={form.tenant_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose your institution...</option>
              <option value="1">Tenant 1</option>
              <option value="2">Tenant 2</option>
            </Select>

            <Input
              label="Full Name"
              name="full_name"
              placeholder="John Doe"
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address"
              name="email"
              placeholder="john@example.com"
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone_number"
              placeholder="9876543210"
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              onChange={handleChange}
              required
            />

            <Button type="submit" variant="primary" className="mt-4">
              Register & Verify
            </Button>

            <p className="mt-6 text-center text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-neon hover:text-white font-bold transition-colors">
                Login
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </>
  );
}
