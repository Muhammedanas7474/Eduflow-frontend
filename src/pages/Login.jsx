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

      const { access, refresh, role } = res.data.data;

     
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "INSTRUCTOR") {
        navigate("/instructor");
      } else {
        navigate("/student");
      }
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
