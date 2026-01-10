import { useState, useEffect } from "react";
import { verifyOTP } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  
  const phone = localStorage.getItem("phone");

  useEffect(() => {
    if (!phone) {
      
      navigate("/");
    }
  }, [phone, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await verifyOTP({
        phone_number: phone,
        otp: otp,
      });

      alert("OTP verified successfully");

      navigate("/login");
    } catch (error) {
      alert("Invalid or expired OTP");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Verify OTP</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />

      <button type="submit">Verify OTP</button>
    </form>
  );
}
