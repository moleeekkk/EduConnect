import React from "react";
import DashboardLayout from "./DashboardLayout";

const StudentLayout = () => {
  return (
    <DashboardLayout
      role="Student"
      defaultUserName="Student User"
      defaultUserDetail="MCA Program"
    />
  );
};

export default StudentLayout;
