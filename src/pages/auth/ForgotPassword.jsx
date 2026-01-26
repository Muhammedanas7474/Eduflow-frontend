import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth.api";
import { Card, Input, Button } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ phone_number: phone });

      localStorage.setItem("phone", phone);
      localStorage.setItem("otp_purpose", "FORGOT_PASSWORD");

      navigate("/reset-password");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <Card title="Reset Password" className="w-full max-w-md">
          <p className="text-gray-400 text-center mb-6">
            Enter your phone number to receive a reset code.
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Phone Number"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Button type="submit" variant="primary">
              Send Reset Code
            </Button>

            <Link to="/login">
              <Button variant="ghost" className="mt-4">
                Back to Login
              </Button>
            </Link>
          </form>
        </Card>
      </div>
    </>
  );
}
