import { useEffect } from "react";
import { loginUser } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const phone = localStorage.getItem("phone");

  useEffect(() => {
    if (!phone) {
      navigate("/");
    }
  }, [phone, navigate]);

  const handleLogin = async () => {
    try {
      const res = await loginUser({ phone_number: phone });

      //  store JWT tokens
      localStorage.setItem("access", res.data.data.access);
      localStorage.setItem("refresh", res.data.data.refresh);
      localStorage.setItem("role", res.data.data.role);

      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <p>Phone verified successfully</p>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
