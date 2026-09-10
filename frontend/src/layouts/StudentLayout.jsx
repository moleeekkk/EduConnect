import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { getAuthUser, getAuthToken } from "../services/api";

const StudentLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!token || !user) {
      navigate("/student-login", { replace: true });
      return;
    }
    if (user.role && user.role !== "ROLE_STUDENT" && user.role !== "Student" && !user.enrollmentNo) {
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

