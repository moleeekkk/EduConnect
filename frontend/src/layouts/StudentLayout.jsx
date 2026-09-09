import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const StudentLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("educonnect_user");
    const token = localStorage.getItem("educonnect_token");
    if (!token || !userStr) {
      navigate("/student-login", { replace: true });
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role && user.role !== "ROLE_STUDENT" && user.role !== "Student" && !user.enrollmentNo) {
        navigate("/student-login", { replace: true });
      }
    } catch (e) {
      navigate("/student-login", { replace: true });
    }
  }, [navigate]);

  return (
    <DashboardLayout
      role="Student"
      defaultUserName="Student User"
      defaultUserDetail="MCA Program"
    />
  );
};

export default StudentLayout;

