import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("educonnect_user");
    const token = localStorage.getItem("educonnect_token");
    if (!token || !userStr) {
      navigate("/admin-login", { replace: true });
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role && user.role !== "ROLE_ADMIN" && user.role !== "Admin") {
        navigate("/admin-login", { replace: true });
      }
    } catch (e) {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  return (
    <DashboardLayout
      role="Admin"
      defaultUserName="Super Administrator"
      defaultUserDetail="admin@educonnect.ac.in"
    />
  );
};

export default AdminLayout;

