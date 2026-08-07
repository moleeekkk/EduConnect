import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import LoginSelection from "../pages/auth/LoginSelection";
import StudentLogin from "../pages/auth/StudentLogin";
import OTPVerification from "../pages/auth/OTPVerification";
import TeacherLogin from "../pages/auth/TeacherLogin";
import AdminLogin from "../pages/auth/AdminLogin";

// Layouts
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import AdminLayout from "../layouts/AdminLayout";

// Student Pages
import StudentDashboard from "../pages/student/Dashboard";
import StudentAttendance from "../pages/student/Attendance";
import StudentAssignments from "../pages/student/Assignments";
import StudentResults from "../pages/student/Results";
import StudentProfile from "../pages/student/Profile";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/Dashboard";
import AttendanceMarker from "../pages/teacher/AttendanceMarker";
import TeacherGrades from "../pages/teacher/Grades";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import CourseManagement from "../pages/admin/CourseManagement";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<LoginSelection />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Student Portal Routes */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Teacher Portal Routes */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="attendance" element={<AttendanceMarker />} />
        <Route path="grades" element={<TeacherGrades />} />
        <Route path="notices" element={<TeacherDashboard />} />
        <Route path="schedule" element={<TeacherDashboard />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="faculty" element={<UserManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="reports" element={<AdminDashboard />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
