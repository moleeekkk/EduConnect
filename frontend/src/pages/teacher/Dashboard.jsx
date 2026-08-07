import React from "react";
import { School, Users, CalendarCheck, FileSpreadsheet, Plus, ArrowRight, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const teacherStats = [
    { title: "Assigned Courses", value: "4 Subjects", sub: "142 Total Students", icon: BookOpen, color: "bg-[#14B8A6]/10 text-[#14B8A6]" },
    { title: "Today's Lectures", value: "3 Sessions", sub: "2 Completed", icon: School, color: "bg-[#2563EB]/10 text-[#2563EB]" },
    { title: "Pending Grading", value: "12 Submissions", sub: "Lab Assignment #3", icon: FileSpreadsheet, color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    { title: "Class Attendance", value: "96.2%", sub: "Average for August", icon: CalendarCheck, color: "bg-[#22C55E]/10 text-[#22C55E]" },
  ];

  const assignedClasses = [
    { id: 1, course: "MCA301: Advanced Web Technologies", room: "Lab 302", time: "09:30 AM - 11:00 AM", totalStudents: 42, status: "Attendance Marked", statusColor: "bg-[#22C55E]/10 text-[#22C55E]" },
    { id: 2, course: "MCA303: Database Architecture Practical", room: "Lab 105", time: "02:00 PM - 04:00 PM", totalStudents: 38, status: "Pending Attendance", statusColor: "bg-[#F97316]/10 text-[#F97316]" },
    { id: 3, course: "MCA102: Data Structures & Algorithms", room: "Hall A", time: "04:30 PM - 05:30 PM", totalStudents: 62, status: "Upcoming", statusColor: "bg-[#2563EB]/10 text-[#2563EB]" },
  ];

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-r from-[#14B8A6] to-[#2563EB] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-3">
            <School className="w-3.5 h-3.5" /> Department of Computer Science
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Dr. Sarah Jenkins!
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Senior Assistant Professor • Employee ID: FAC-8092
          </p>
        </div>

        <div className="z-10 flex gap-3">
          <Button
            variant="accent"
            onClick={() => navigate("/teacher/attendance")}
            icon={CalendarCheck}
            className="text-xs shadow-md"
          >
            Mark Class Attendance
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teacherStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xs font-medium text-[#64748B]">{stat.title}</h3>
              <p className="text-2xl font-extrabold text-[#1E293B] mt-1">{stat.value}</p>
              <p className="text-[11px] text-[#64748B] mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Class Schedule & Quick Attendance Marker */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">Today's Teaching Sessions</h2>
            <p className="text-xs text-[#64748B]">Click on any class to record attendance or update lecture notes.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/teacher/attendance")}
            icon={CalendarCheck}
            className="text-xs"
          >
            Take Attendance
          </Button>
        </div>

        <div className="space-y-3">
          {assignedClasses.map((cls) => (
            <div
              key={cls.id}
              className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#14B8A6] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B]">{cls.course}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
                    <span>Room: <strong className="text-[#1E293B]">{cls.room}</strong></span>
                    <span>•</span>
                    <span>Enrolled: <strong className="text-[#1E293B]">{cls.totalStudents} Students</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cls.statusColor}`}>
                  {cls.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/teacher/attendance")}
                  className="text-xs"
                >
                  Mark Attendance
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
