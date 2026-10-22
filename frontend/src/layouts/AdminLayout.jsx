import React from "react";
import DashboardLayout from "./DashboardLayout";

const AdminLayout = () => {
  return (
    <DashboardLayout
      role="Admin"
      defaultUserName="Administrator"
      defaultUserDetail=""
    />
  );
};

export default AdminLayout;
