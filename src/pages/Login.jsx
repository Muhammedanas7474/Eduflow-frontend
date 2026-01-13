import { loginUser } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await loginUser({ phone_number: "dummy" });

      const { access, refresh, role } = res.data.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      if (role === "ADMIN") navigate("/admin");
      else if (role === "INSTRUCTOR") navigate("/instructor");
      else navigate("/student");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
