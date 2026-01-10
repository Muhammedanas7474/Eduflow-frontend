import { useState } from "react";
import { sendOTP } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function SendOTP() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendOTP({ phone_number: phone });
      localStorage.setItem("phone", phone);
      navigate("/verify");
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Send OTP</h2>

      <input
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button type="submit">Send OTP</button>
    </form>
  );
}
