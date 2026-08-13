import React from "react";
import DashboardLayout from "./DashboardLayout";

const AdminLayout = () => {
  return (
    <DashboardLayout
      role="Admin"
      defaultUserName="Super Administrator"
      defaultUserDetail="admin@educonnect.ac.in"
    />
  );
};

export default AdminLayout;
