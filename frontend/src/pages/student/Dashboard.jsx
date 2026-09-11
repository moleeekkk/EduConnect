import React, { useState, useEffect } from "react";
import { CalendarCheck, BookOpen, Award, Clock, ArrowRight, User, FileText, Sparkles, CheckSquare, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;

  const [dashData, setDashData] = useState({
    enrollmentNo: loggedUser?.identifier || "25CI2110016",
    firstName: loggedUser?.name ? loggedUser.name.split(" ")[0] : "Student",
    lastName: loggedUser?.name && loggedUser.name.split(" ").length > 1 ? loggedUser.name.split(" ").slice(1).join(" ") : "User",
    sessions: [],
    announcements: [],
    attendancePct: "88.5%",
    cgpa: "8.89 / 10.0",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, ttRes, noticeRes] = await Promise.all([
          studentApi.getDashboard(dashData.enrollmentNo).catch(() => null),
          studentApi.getTimetable(dashData.enrollmentNo).catch(() => []),
          studentApi.getNotices().catch(() => []),
        ]);

        const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
        const todayDayObj = Array.isArray(ttRes) ? ttRes.find(d => (d.day || "").toLowerCase() === todayDay.toLowerCase()) : null;
        const todaySessions = todayDayObj && Array.isArray(todayDayObj.slots)
          ? todayDayObj.slots.map((s, idx) => ({
              session_id: s.timetable_id || s.id || idx,
              lecture_no: idx + 1,
              start_time: s.start_time || s.time?.split("-")[0]?.trim() || "09:00",
              end_time: s.end_time || s.time?.split("-")[1]?.trim() || "10:00",
              topic: `${s.subject || "Academic Session"} (${s.room || "Classroom"})`,
              subject_name: s.subject,
              room: s.room,
            }))
          : (Array.isArray(res?.sessions) ? res.sessions : []);

        const finalAnnouncements = Array.isArray(noticeRes) && noticeRes.length > 0
          ? noticeRes
          : (Array.isArray(res?.announcements) ? res.announcements : []);

        setDashData((prev) => ({
          ...prev,
          ...(res || {}),
          sessions: todaySessions,
          announcements: finalAnnouncements,
        }));
      } catch (err) {
        console.error("Student dashboard load error:", err);
      }
    };

    fetchData();
  }, [dashData.enrollmentNo]);

  const currentStudent = {
    enrollment_no: dashData.enrollmentNo,
    first_name: dashData.firstName,
    last_name: dashData.lastName,
  };

  const stats = [
    {
      title: "Overall Attendance",
      value: "88.5%",
      subtext: "Semester 3 Attendance Record",
      status: "Good",
      statusColor: "bg-[#22C55E]/10 text-[#22C55E]",
      icon: CalendarCheck,
      iconBg: "bg-[#14B8A6]/10 text-[#14B8A6]",
    },
    {
      title: "Current CGPA",
      value: "8.89 / 10.0",
      subtext: "SGPA Sem 2: 8.92",
      status: "Excellent",
      statusColor: "bg-[#2563EB]/10 text-[#2563EB]",
      icon: Award,
      iconBg: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    {
      title: "Enrolled Courses",
      value: "4 Subjects",
      subtext: "15 Semester Credits",
      status: "Active",
      statusColor: "bg-[#F59E0B]/10 text-[#F59E0B]",
      icon: BookOpen,
      iconBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
    {
      title: "Pending Tasks",
      value: "2 Assignments",
      subtext: "Due this week",
      status: "Pending",
      statusColor: "bg-[#F97316]/10 text-[#F97316]",
      icon: Clock,
      iconBg: "bg-[#F97316]/10 text-[#F97316]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-2">
            Enrollment: {currentStudent.enrollment_no}
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {currentStudent.first_name} {currentStudent.last_name}!
          </h1>
          <p className="text-white/80 text-xs mt-1">
            Master of Computer Applications • Semester 3 • Batch 2025-2027
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
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
            <h2 className="text-base font-bold text-[#1E293B]">Today's Academic Sessions</h2>
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
            {dashData.sessions.map((session, idx) => (
              <div key={session.session_id || idx} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1E293B]">Lecture #{session.lecture_no || idx + 1}</span>
                    <span className="text-[#64748B]">• {session.start_time || "09:00"} - {session.end_time || "10:00"}</span>
                  </div>
                  <p className="text-xs font-medium text-[#2563EB] mt-0.5">{session.topic || session.subject_name || "Academic Session"}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold self-start sm:self-auto">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
            <span>Latest Announcements</span>
            <span className="text-xs font-normal text-[#64748B]">({dashData.announcements.length})</span>
          </h2>
          <div className="space-y-3">
            {dashData.announcements.length === 0 ? (
              <div className="text-center py-6 text-[#64748B] space-y-1">
                <Bell className="w-8 h-8 mx-auto text-[#94A3B8]" />
                <p className="text-xs font-medium">No announcements at this time.</p>
              </div>
            ) : (
              dashData.announcements.map((notice, idx) => (
                <div key={notice.id || notice.notice_id || idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase">{notice.target_role || "ALL"}</span>
                    <span className="text-[10px] text-[#64748B]">{notice.date || notice.publish_date?.substring(0, 10)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1E293B]">{notice.title}</h4>
                  <p className="text-[11px] text-[#64748B] line-clamp-3 leading-snug">{notice.description}</p>
                  {notice.author_name && (
                    <p className="text-[9px] text-[#94A3B8] pt-1">By: {notice.author_name}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
