import { useState } from "react";
import { sendOTP } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function SendOTP() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendOTP({ phone_number: phone });
      localStorage.setItem("phone", phone);
      navigate("/verify");
    } catch {
      alert("Error sending OTP");
    }
  };

  return (
    <AuthLayout title="Login with Phone">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Send OTP
        </button>
      </form>
    </AuthLayout>
  );
}
