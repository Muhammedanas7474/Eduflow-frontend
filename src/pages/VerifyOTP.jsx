import { useState, useEffect } from "react";
import { verifyOTP } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const phone = localStorage.getItem("phone");

  useEffect(() => {
    if (!phone) navigate("/");
  }, [phone, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP({ phone_number: phone, otp });
      navigate("/login");
    } catch {
      alert("Invalid or expired OTP");
    }
  };

  return (
    <AuthLayout title="Verify OTP">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 py-2 text-white hover:bg-green-700"
        >
          Verify OTP
        </button>
      </form>
    </AuthLayout>
  );
}
