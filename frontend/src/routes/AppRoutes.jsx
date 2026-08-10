import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import LoginSelection from "../pages/auth/LoginSelection";
import StudentLogin from "../pages/auth/StudentLogin";
import OTPVerification from "../pages/auth/OTPVerification";
import TeacherLogin from "../pages/auth/TeacherLogin";
import AdminLogin from "../pages/auth/AdminLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Layouts
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import AdminLayout from "../layouts/AdminLayout";

// Student Pages
import StudentDashboard from "../pages/student/Dashboard";
import StudentProfile from "../pages/student/Profile";
import StudentAttendance from "../pages/student/Attendance";
import StudentMarksheet from "../pages/student/Marksheet";
import StudentTimetable from "../pages/student/Timetable";
import StudentAssignments from "../pages/student/Assignments";
import StudentWeeklyTests from "../pages/student/WeeklyTests";
import StudentQuizPractice from "../pages/student/QuizPractice";
import StudentStudyMaterial from "../pages/student/StudyMaterial";
import StudentOldQuestionPaper from "../pages/student/OldQuestionPaper";
import StudentDigitalID from "../pages/student/DigitalID";
import StudentLeaveRequest from "../pages/student/LeaveRequest";
import StudentAskDoubts from "../pages/student/AskDoubts";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherProfile from "../pages/teacher/Profile";
import TeacherManageStudents from "../pages/teacher/ManageStudents";
import TeacherAttendanceMarker from "../pages/teacher/AttendanceMarker";
import TeacherUploadAssignment from "../pages/teacher/UploadAssignment";
import TeacherWeeklyTests from "../pages/teacher/WeeklyTests";
import TeacherQuizPractice from "../pages/teacher/QuizPractice";
import TeacherStudyMaterial from "../pages/teacher/StudyMaterial";
import TeacherOldQuestionPaper from "../pages/teacher/OldQuestionPaper";
import TeacherReplyDoubts from "../pages/teacher/ReplyDoubts";
import TeacherLeaveManagement from "../pages/teacher/LeaveManagement";
import TeacherParentEmail from "../pages/teacher/ParentEmail";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminProfile from "../pages/admin/Profile";
import AdminUserManagement from "../pages/admin/UserManagement";
import AdminInstituteManagement from "../pages/admin/InstituteManagement";
import AdminProgramManagement from "../pages/admin/ProgramManagement";
import AdminSubjectManagement from "../pages/admin/SubjectManagement";
import AdminReports from "../pages/admin/Reports";
import AdminAnnouncements from "../pages/admin/Announcements";
import AdminSystemSettings from "../pages/admin/SystemSettings";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<LoginSelection />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student Portal Routes */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="marksheet" element={<StudentMarksheet />} />
        <Route path="results" element={<StudentMarksheet />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="weekly-tests" element={<StudentWeeklyTests />} />
        <Route path="quiz-practice" element={<StudentQuizPractice />} />
        <Route path="study-material" element={<StudentStudyMaterial />} />
        <Route path="old-papers" element={<StudentOldQuestionPaper />} />
        <Route path="digital-id" element={<StudentDigitalID />} />
        <Route path="leave-request" element={<StudentLeaveRequest />} />
        <Route path="doubts" element={<StudentAskDoubts />} />
      </Route>

      {/* Teacher Portal Routes */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="students" element={<TeacherManageStudents />} />
        <Route path="attendance" element={<TeacherAttendanceMarker />} />
        <Route path="assignments" element={<TeacherUploadAssignment />} />
        <Route path="grades" element={<TeacherUploadAssignment />} />
        <Route path="weekly-tests" element={<TeacherWeeklyTests />} />
        <Route path="quiz-practice" element={<TeacherQuizPractice />} />
        <Route path="study-material" element={<TeacherStudyMaterial />} />
        <Route path="old-papers" element={<TeacherOldQuestionPaper />} />
        <Route path="reply-doubts" element={<TeacherReplyDoubts />} />
        <Route path="leave-management" element={<TeacherLeaveManagement />} />
        <Route path="parent-email" element={<TeacherParentEmail />} />
        <Route path="notices" element={<TeacherDashboard />} />
        <Route path="schedule" element={<TeacherDashboard />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="students" element={<AdminUserManagement key="students-mgmt" initialTab="students" />} />
        <Route path="teachers" element={<AdminUserManagement key="teachers-mgmt" initialTab="teachers" />} />
        <Route path="users" element={<AdminUserManagement key="users-mgmt" initialTab="students" />} />
        <Route path="faculty" element={<AdminUserManagement key="faculty-mgmt" initialTab="teachers" />} />
        <Route path="institutes" element={<AdminInstituteManagement />} />
        <Route path="programs" element={<AdminProgramManagement />} />
        <Route path="courses" element={<AdminProgramManagement />} />
        <Route path="subjects" element={<AdminSubjectManagement />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="settings" element={<AdminSystemSettings />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
