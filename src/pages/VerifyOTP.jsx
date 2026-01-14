import { useState, useEffect } from "react";
import { verifyOTP } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const phone = localStorage.getItem("phone");
  const purpose = localStorage.getItem("otp_context"); // login | register

  useEffect(() => {
    if (!phone || !purpose) navigate("/");
  }, [phone, purpose, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await verifyOTP({
        phone_number: phone,
        otp,
        purpose, // 🔥 THIS WAS MISSING
      });

      const { access, refresh, role } = res.data.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      localStorage.removeItem("otp_context");

      redirectByRole(role);
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    }
  };

  const redirectByRole = (role) => {
    if (role === "ADMIN") navigate("/admin");
    else if (role === "INSTRUCTOR") navigate("/instructor");
    else navigate("/student");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>

        <input
          placeholder="Enter OTP"
          className="input"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button className="btn-success">Verify & Continue</button>
      </form>
    </div>
  );
}
