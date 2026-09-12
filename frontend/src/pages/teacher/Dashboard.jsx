import React, { useState, useEffect } from "react";
import { School, Users, CalendarCheck, FileSpreadsheet, Plus, ArrowRight, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;

  const [dashData, setDashData] = useState({
    employee_id: loggedUser?.identifier || "",
    first_name: loggedUser?.name ? loggedUser.name.split(" ")[0] : "Faculty",
    last_name: loggedUser?.name && loggedUser.name.split(" ").length > 1 ? loggedUser.name.split(" ").slice(1).join(" ") : "Member",
    designation: "Assistant Professor",
    qualification: "Ph.D. in Computer Science",
    experience: 5,
    sessions: [],
    assignmentsCount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const identifier = loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;

      try {
        const [dashRes, profileRes, schedRes] = await Promise.all([
          teacherApi.getDashboard(identifier).catch(() => null),
          teacherApi.getProfile(identifier).catch(() => null),
          teacherApi.getSchedule(identifier).catch(() => []),
        ]);

        const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
        const todayDayObj = Array.isArray(schedRes) ? schedRes.find(d => (d.day || "").toLowerCase() === todayDay.toLowerCase()) : null;
        const todaySessions = todayDayObj && Array.isArray(todayDayObj.slots)
          ? todayDayObj.slots.map((s, idx) => ({
              session_id: s.timetable_id || s.id || idx,
              lecture_no: idx + 1,
              start_time: s.start_time || s.time?.split("-")[0]?.trim() || "09:30",
              end_time: s.end_time || s.time?.split("-")[1]?.trim() || "11:00",
              topic: `${s.subject || "Academic Class"} (${s.room || "Lab"})`,
              subject_name: s.subject,
              room: s.room,
            }))
          : (Array.isArray(dashRes?.sessions) ? dashRes.sessions : []);

        setDashData((prev) => ({
          ...prev,
          ...(profileRes && (profileRes.first_name || profileRes.email) ? profileRes : {}),
          ...(dashRes || {}),
          sessions: todaySessions,
        }));
      } catch (err) {
        console.error("Teacher dashboard load error:", err);
      }
    };
    fetchData();
  }, []);

  const teacher = {
    employee_id: dashData.employee_id,
    first_name: dashData.first_name,
    last_name: dashData.last_name,
    designation: dashData.designation,
    qualification: dashData.qualification,
    experience: dashData.experience,
  };

  const teacherStats = [
    { title: "Assigned Courses", value: `${dashData.assignedCoursesCount ?? 0} Subjects`, sub: `${dashData.totalStudents ?? 0} Total Students`, icon: BookOpen, color: "bg-[#14B8A6]/10 text-[#14B8A6]" },
    { title: "Teaching Experience", value: `${teacher.experience ?? 0} Years`, sub: teacher.designation || "Assistant Professor", icon: School, color: "bg-[#2563EB]/10 text-[#2563EB]" },
    { title: "Active Assignments", value: `${dashData.assignmentsCount ?? 0} Uploaded`, sub: `${dashData.pendingGradingCount ?? 0} Pending Grading`, icon: FileSpreadsheet, color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    { title: "Average Class Attendance", value: dashData.attendanceRate || "0%", sub: "Recorded Sessions Average", icon: CalendarCheck, color: "bg-[#22C55E]/10 text-[#22C55E]" },
  ];

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="bg-gradient-to-r from-[#14B8A6] to-[#2563EB] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {teacher.first_name} {teacher.last_name}!
          </h1>
          <p className="text-white/80 text-xs mt-1">
            {teacher.designation} • {teacher.qualification}
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
          {dashData.sessions.map((session, idx) => (
            <div key={session.session_id || idx} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#1E293B]">Lecture #{session.lecture_no || idx + 1} ({session.start_time || "09:30"} - {session.end_time || "11:00"})</span>
                <p className="text-xs font-medium text-[#2563EB] mt-0.5">{session.topic || "Academic Lecture"}</p>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
