import React from "react";
import { GraduationCap, CalendarCheck, BookOpen, Award, Clock, ArrowRight, CheckCircle2, AlertCircle, FileText, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Overall Attendance",
      value: "88.5%",
      subtext: "+2.1% from last month",
      status: "On Track",
      statusColor: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
      icon: CalendarCheck,
      iconBg: "bg-[#14B8A6]/10 text-[#14B8A6]",
    },
    {
      title: "Current CGPA",
      value: "8.75 / 10",
      subtext: "Semester 3 Rank: 4th",
      status: "Excellent",
      statusColor: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20",
      icon: Award,
      iconBg: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    {
      title: "Active Courses",
      value: "6 Subjects",
      subtext: "2 Lab Practicals",
      status: "Enrolled",
      statusColor: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
      icon: BookOpen,
      iconBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
    {
      title: "Pending Submissions",
      value: "2 Tasks",
      subtext: "Due this Friday",
      status: "Action Required",
      statusColor: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20",
      icon: Clock,
      iconBg: "bg-[#F97316]/10 text-[#F97316]",
    },
  ];

  const todayClasses = [
    { subject: "Advanced Web Technologies", time: "09:30 AM - 11:00 AM", room: "Lab 302", teacher: "Dr. Sarah Jenkins", type: "Lecture" },
    { subject: "Cloud Infrastructure & DevOps", time: "11:30 AM - 01:00 PM", room: "Hall B", teacher: "Prof. Michael Vance", type: "Theory" },
    { subject: "Database Architecture Practical", time: "02:00 PM - 04:00 PM", room: "Lab 105", teacher: "Er. Rahul Mehta", type: "Practical" },
  ];

  const recentAnnouncements = [
    { id: 1, title: "Mid-Term Examination Schedule Released", date: "Aug 06, 2026", dept: "Academic Office" },
    { id: 2, title: "Workshop on Next.js 15 Architecture", date: "Aug 04, 2026", dept: "Computer Science Dept" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-3">
            <GraduationCap className="w-3.5 h-3.5" /> Enrollment ID: 2024MCA001
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Alex Johnson!
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-lg">
            Master of Computer Applications • Semester 3 • 88.5% Attendance Record
          </p>
        </div>

        <div className="z-10 flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/student/attendance")}
            className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20 text-xs"
          >
            View Attendance
          </Button>
          <Button
            variant="accent"
            onClick={() => navigate("/student/assignments")}
            className="text-xs"
          >
            Submit Assignments
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.statusColor}`}>
                  {stat.status}
                </span>
              </div>
              <h3 className="text-xs font-medium text-[#64748B]">{stat.title}</h3>
              <p className="text-2xl font-extrabold text-[#1E293B] mt-1">{stat.value}</p>
              <p className="text-[11px] text-[#64748B] mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">Today's Lecture Schedule</h2>
              <p className="text-xs text-[#64748B]">Friday, August 07, 2026</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-semibold">
              3 Classes Today
            </span>
          </div>

          <div className="space-y-3">
            {todayClasses.map((cls, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#2563EB]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">{cls.subject}</h3>
                    <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                      <span>{cls.teacher}</span> • <span className="font-semibold text-[#14B8A6]">{cls.room}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs border-t sm:border-t-0 border-[#E2E8F0] pt-2 sm:pt-0">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] font-mono text-[#1E293B]">
                    {cls.time}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] text-[10px] font-bold">
                    {cls.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Announcements & Deadlines */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 mb-4">
              <Bell className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-base font-bold text-[#1E293B]">Campus Notices</h2>
            </div>
            <div className="space-y-3">
              {recentAnnouncements.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#2563EB]">{item.dept}</span>
                  <h4 className="text-xs font-bold text-[#1E293B] mt-1">{item.title}</h4>
                  <p className="text-[10px] text-[#64748B] mt-1">{item.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs text-center">
            <h3 className="text-sm font-bold text-[#1E293B]">Need Help or Academic Counseling?</h3>
            <p className="text-xs text-[#64748B] mt-1 mb-4">Contact your faculty mentor or reach out to the EduConnect student desk.</p>
            <Button variant="outline" size="sm" fullWidth className="text-xs">
              Raise Support Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
