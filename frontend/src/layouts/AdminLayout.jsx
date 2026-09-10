import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { getAuthUser, getAuthToken } from "../services/api";

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!token || !user) {
      navigate("/admin-login", { replace: true });
      return;
    }
    if (user.role && user.role !== "ROLE_ADMIN" && user.role !== "Admin") {
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

