import React, { useState, useEffect } from "react";
import { CalendarCheck, BookOpen, Award, Clock, ArrowRight, User, FileText, Sparkles, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;

  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState({
    enrollmentNo: loggedUser?.student_id || loggedUser?.studentId || loggedUser?.enrollment_no || loggedUser?.enrollmentNo || loggedUser?.identifier || "24CI2110001",
    firstName: loggedUser?.first_name || (loggedUser?.name ? loggedUser.name.split(" ")[0] : ""),
    lastName: loggedUser?.last_name || (loggedUser?.name && loggedUser.name.split(" ").length > 1 ? loggedUser.name.split(" ").slice(1).join(" ") : ""),
    studentName: loggedUser?.name || "Student",
    program: "Department of Computer Applications",
    semester: "Semester 3",
    sessions: [],
    announcements: [],
    overallAttendance: "100.0%",
    attendancePct: "100.0%",
    cgpa: "8.89 / 10.0",
    enrolledCoursesCount: 0,
    pendingAssignmentsCount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const identifier = dashData.enrollmentNo || loggedUser?.identifier || "24CI2110001";
        const res = await studentApi.getDashboard(identifier);
        if (res) {
          setDashData((prev) => ({
            ...prev,
            ...res,
            sessions: Array.isArray(res.sessions) ? res.sessions : (Array.isArray(res.todayClasses) ? res.todayClasses : prev.sessions),
            announcements: Array.isArray(res.announcements) ? res.announcements : prev.announcements,
          }));
        }
      } catch (err) {
        console.error("Student dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStudent = {
    enrollment_no: dashData.enrollmentNo || loggedUser?.enrollment_no || "24CI2110001",
    first_name: dashData.firstName || dashData.first_name || (loggedUser?.name ? loggedUser.name.split(" ")[0] : "Student"),
    last_name: dashData.lastName || dashData.last_name || "",
  };

  const attendanceVal = dashData.overallAttendance || dashData.attendancePct || "100.0%";
  const attendanceStat = dashData.attendanceStatus || (parseFloat(attendanceVal) >= 85 ? "Good" : parseFloat(attendanceVal) >= 75 ? "Average" : "At-Risk");
  const attendanceColor = attendanceStat === "Good" ? "bg-[#22C55E]/10 text-[#22C55E]" : attendanceStat === "Average" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#EF4444]/10 text-[#EF4444]";

  const enrolledCount = dashData.enrolledCoursesCount || dashData.subjectsCount || (Array.isArray(dashData.subjects) ? dashData.subjects.length : 0);
  const totalCredits = dashData.totalCredits || (enrolledCount * 4);
  const pendingAssignments = dashData.pendingAssignmentsCount || dashData.pendingTasksCount || 0;

  const stats = [
    {
      title: "Overall Attendance",
      value: attendanceVal,
      subtext: `${dashData.semesterName || dashData.semester || "Semester"} Attendance Record`,
      status: attendanceStat,
      statusColor: attendanceColor,
      icon: CalendarCheck,
      iconBg: "bg-[#14B8A6]/10 text-[#14B8A6]",
    },
    {
      title: "Enrolled Courses",
      value: `${enrolledCount} Subjects`,
      subtext: `${totalCredits} Semester Credits`,
      status: "Active",
      statusColor: "bg-[#F59E0B]/10 text-[#F59E0B]",
      icon: BookOpen,
      iconBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
    {
      title: "Pending Tasks",
      value: `${pendingAssignments} ${pendingAssignments === 1 ? "Assignment" : "Assignments"}`,
      subtext: pendingAssignments > 0 ? "Requires submission" : "All completed",
      status: pendingAssignments > 0 ? "Pending" : "Completed",
      statusColor: pendingAssignments > 0 ? "bg-[#F97316]/10 text-[#F97316]" : "bg-[#22C55E]/10 text-[#22C55E]",
      icon: Clock,
      iconBg: "bg-[#F97316]/10 text-[#F97316]",
    },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            Welcome back, {currentStudent.first_name}!
          </h1>
          <p className="text-xs opacity-90 mt-1 font-medium">
            {currentStudent.enrollment_no ? `Enrollment No: ${currentStudent.enrollment_no}` : ""} {dashData.departmentName || dashData.program ? `• ${dashData.departmentName || dashData.program}` : ""} {dashData.semesterName || dashData.semester ? `• ${dashData.semesterName || dashData.semester}` : ""}
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs hover:border-[#2563EB]/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.statusColor}`}>
                  {stat.status}
                </span>
              </div>
              <h3 className="text-xs font-medium text-[#64748B]">{stat.title}</h3>
              <p className="text-xl font-bold text-[#1E293B] mt-0.5">{stat.value}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Lectures */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Today's Academic Sessions</h2>
              <p className="text-[11px] text-[#64748B]">Scheduled lectures and lecture sessions for your batch</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/student/attendance")}
              className="text-xs"
            >
              Full Attendance
            </Button>
          </div>

          <div className="space-y-3">
            {dashData.sessions && dashData.sessions.length > 0 ? (
              dashData.sessions.map((session, idx) => (
                <div key={session.session_id || session.attendance_id || idx} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1E293B]">{session.subject_code || `Lecture #${session.lecture_no || idx + 1}`}</span>
                      <span className="text-[#64748B]">• {session.start_time || "09:00"} - {session.end_time || "10:00"}</span>
                      {session.session_date && (
                        <span className="text-[10px] font-mono font-medium text-[#2563EB] bg-[#2563EB]/10 px-1.5 py-0.5 rounded-md">
                          {session.session_date}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#2563EB] mt-0.5">{session.subject_name || session.topic || "Academic Lecture Session"}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${session.status === "Present" ? "bg-[#22C55E]/10 text-[#22C55E]" : session.status === "Absent" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#2563EB]/10 text-[#2563EB]"}`}>
                    {session.status || "Scheduled"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] space-y-1">
                <BookOpen className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="font-bold text-[#1E293B]">No academic sessions recorded for today</p>
                <p className="text-[11px]">Check back later or view full attendance history.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h2 className="text-base font-bold text-[#1E293B]">Latest Announcements</h2>
            <p className="text-[11px] text-[#64748B]">Recent updates & uploaded study materials</p>
          </div>
          <div className="space-y-3">
            {dashData.announcements && dashData.announcements.length > 0 ? (
              dashData.announcements.map((notice, idx) => (
                <div key={notice.id || idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase">{notice.target_role || "STUDENTS"}</span>
                  <h4 className="text-xs font-bold text-[#1E293B]">{notice.title}</h4>
                  <p className="text-[11px] text-[#64748B] line-clamp-2">{notice.description}</p>
                  <p className="text-[10px] font-mono text-[#64748B]">{notice.date}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#64748B]">
                No recent announcements.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
