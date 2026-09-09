import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const TeacherLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("educonnect_user");
    const token = localStorage.getItem("educonnect_token");
    if (!token || !userStr) {
      navigate("/teacher-login", { replace: true });
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role && user.role !== "ROLE_TEACHER" && user.role !== "Teacher") {
        navigate("/teacher-login", { replace: true });
      }
    } catch (e) {
      navigate("/teacher-login", { replace: true });
    }
  }, [navigate]);

  return (
    <DashboardLayout
      role="Teacher"
      defaultUserName="Faculty Member"
      defaultUserDetail="Dept. of CA"
    />
  );
};

export default TeacherLayout;

