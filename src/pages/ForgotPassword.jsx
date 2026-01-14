import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth.api";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ phone_number: phone });

      localStorage.setItem("phone", phone);
      localStorage.setItem("otp_context", "forgot");

      navigate("/reset-password");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 w-96 rounded shadow">
        <h2 className="text-xl font-bold mb-4 text-center">Forgot Password</h2>

        <input
          className="w-full p-2 border rounded mb-4"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Send OTP
        </button>
      </form>
    </div>
  );
}
