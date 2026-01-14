import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth.api";

export default function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const phone = localStorage.getItem("phone");
  const context = localStorage.getItem("otp_context");

  useEffect(() => {
    if (!phone || context !== "forgot") {
      navigate("/");
    }
  }, [phone, context, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({
        phone_number: phone,
        otp,
        new_password: password,
      });

      alert("Password reset successful");

      localStorage.removeItem("otp_context");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 w-96 rounded shadow">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full p-2 border rounded mb-4"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
}
