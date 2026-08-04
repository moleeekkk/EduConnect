import { Routes, Route } from "react-router-dom";
import LoginSelection from "../pages/auth/LoginSelection";
import StudentLogin from "../pages/auth/StudentLogin";
import OTPVerification from "../pages/auth/OTPVerification";
import Dashboard from "../pages/student/Dashboard";
import StudentLayout from "../layouts/StudentLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginSelection />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
