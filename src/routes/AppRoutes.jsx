import { BrowserRouter, Routes, Route } from "react-router-dom";
import SendOTP from "../pages/SendOTP";
import VerifyOTP from "../pages/VerifyOTP";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SendOTP />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  );
}
