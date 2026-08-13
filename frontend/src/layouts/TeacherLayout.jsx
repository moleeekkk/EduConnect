import React from "react";
import DashboardLayout from "./DashboardLayout";

const TeacherLayout = () => {
  return (
    <DashboardLayout
      role="Teacher"
      defaultUserName="Faculty Member"
      defaultUserDetail="Dept. of CA"
    />
  );
};

export default TeacherLayout;
