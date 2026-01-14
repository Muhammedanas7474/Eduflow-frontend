import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerUser(form);

      localStorage.setItem("phone", form.phone_number);
      localStorage.setItem("otp_context", "register");

      navigate("/verify");
    } catch (err) {
      alert(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

        <input name="full_name" placeholder="Full Name" className="input" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="input" onChange={handleChange} required />
        <input name="phone_number" placeholder="Phone Number" className="input" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} required />

        <button className="btn-primary">Register & Send OTP</button>
      </form>
    </div>
  );
}
