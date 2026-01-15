import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth.api";
import { Card, Input, Button } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    otp: "",
    new_password: "",
  });

  const phone = localStorage.getItem("phone");

  useEffect(() => {
    if (!phone) navigate("/forgot-password");
  }, [phone, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({
        phone_number: phone,
        ...form
      });

      localStorage.removeItem("otp_purpose");
      navigate("/login");
      alert("Password reset successful. Please login.");
    } catch (err) {
      alert(err?.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <Card title="Set New Password" className="w-full max-w-md">
          <p className="text-gray-400 text-center mb-6">
            Enter the OTP sent to <span className="text-neon">{phone}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="One-Time Password"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={form.otp}
              onChange={handleChange}
              required
            />

            <Input
              label="New Password"
              name="new_password"
              type="password"
              placeholder="Enter new password"
              value={form.new_password}
              onChange={handleChange}
              required
            />

            <Button type="submit" variant="primary">
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
