import React from "react";
import { School, CalendarCheck, FileSpreadsheet, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { mockAttendanceSessions, mockAssignments } from "../../data/mockData";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;
  const teacher = {
    employee_id: loggedUser?.identifier || "",
    first_name: loggedUser?.name ? loggedUser.name.split(" ")[0] : "Faculty",
    last_name: loggedUser?.name && loggedUser.name.split(" ").length > 1 ? loggedUser.name.split(" ").slice(1).join(" ") : "",
    designation: "Faculty Member",
    qualification: "",
    experience: 0,
  };

  const teacherStats = [
    { title: "Assigned Courses", value: "0 Subjects", sub: "Course Work", icon: BookOpen, color: "bg-[#14B8A6]/10 text-[#14B8A6]" },
    { title: "Teaching Experience", value: "Faculty", sub: "Department Faculty", icon: School, color: "bg-[#2563EB]/10 text-[#2563EB]" },
    { title: "Active Assignments", value: `${mockAssignments?.length || 0} Uploaded`, sub: "Course assignments", icon: FileSpreadsheet, color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    { title: "Average Class Attendance", value: "0%", sub: "Class record", icon: CalendarCheck, color: "bg-[#22C55E]/10 text-[#22C55E]" },
  ];

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="bg-gradient-to-r from-[#14B8A6] to-[#2563EB] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {teacher.employee_id && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-2">
              Employee ID: {teacher.employee_id}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {teacher.first_name} {teacher.last_name}!
          </h1>
          <p className="text-white/80 text-xs mt-1">
            Faculty Portal Control Center
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teacherStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xs font-medium text-[#64748B]">{stat.title}</h3>
              <p className="text-xl font-bold text-[#1E293B] mt-0.5">{stat.value}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Teaching Sessions Table */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h2 className="text-base font-bold text-[#1E293B]">Today's Teaching Sessions</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/teacher/attendance")} className="text-xs">
            Manage Attendance
          </Button>
        </div>

        <div className="space-y-3 text-xs">
          {mockAttendanceSessions && mockAttendanceSessions.length > 0 ? (
            mockAttendanceSessions.map((session) => (
              <div key={session.session_id} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#1E293B]">Lecture #{session.lecture_no} ({session.start_time} - {session.end_time})</span>
                  <p className="text-xs font-medium text-[#2563EB] mt-0.5">{session.topic}</p>
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => navigate("/teacher/attendance")}
                  className="text-xs self-start sm:self-auto"
                >
                  Mark Attendance
                </Button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              No teaching sessions scheduled today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
