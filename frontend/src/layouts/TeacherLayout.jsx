import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { getAuthUser, getAuthToken } from "../services/api";

const TeacherLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!token || !user) {
      navigate("/teacher-login", { replace: true });
      return;
    }
    if (user.role && user.role !== "ROLE_TEACHER" && user.role !== "Teacher") {
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

