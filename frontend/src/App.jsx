import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import TenantDetails from "./pages/TenantDetails";
import UserQueueStatus from "./pages/UserQueueStatus";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Utama / Default dialihkan ke Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Jalur Halaman Aplikasi */}
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        {/* <Route path="/tenant/:id" element={<TenantDetails />} /> */}
        <Route path="/queue-status" element={<UserQueueStatus />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Halaman 404 jika URL salah */}
        <Route path="*" element={<div className="p-8 text-center">Page Not Found</div>} />
      </Routes>
    </Router>
  );
}