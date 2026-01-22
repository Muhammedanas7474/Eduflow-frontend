import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "../../api/auth.api";
import { Card, Input, Button } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const phone = localStorage.getItem("phone");
  const purpose = localStorage.getItem("otp_purpose");

  useEffect(() => {
    if (!phone || !purpose) navigate("/");
  }, [phone, purpose, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await verifyOTP({
        phone_number: phone,
        otp,
        purpose,
      });

      const { access, refresh, role } = res.data.data;

      // Update localStorage (for persistence)
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      // Update Redux state
      dispatch(setCredentials({ access, refresh, role }));

      if (role === "ADMIN") navigate("/admin");
      else if (role === "INSTRUCTOR") navigate("/instructor");
      else navigate("/student");

      localStorage.removeItem("otp_purpose");
    } catch (err) {
      console.error("OTP Verification Error:", err);
      alert(err?.response?.data?.message || "OTP failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <Card title="Verify Details" className="w-full max-w-md">
          <p className="text-gray-400 text-center mb-6">
            We've sent a code to <span className="text-neon">{phone}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="One-Time Password"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center tracking-[1em] font-mono text-lg"
              maxLength={6}
              required
            />

            <Button type="submit" variant="primary">
              Verify & Proceed
            </Button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full mt-4 text-gray-500 hover:text-white transition-colors"
            >
              Back
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
