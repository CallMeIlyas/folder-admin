import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLogin from "../../components/admin/auth/AdminLogin";
import { apiFetch } from "@/utils/api";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login gagal");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      navigate("/admin/dashboard", { replace: true });
      return true;
    } catch (err: any) {
      setError(err.message || "Email atau password salah");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLogin
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default AdminLoginPage;