import React from "react";
import { ShieldCheck, Users, School, BookOpen, Activity, UserPlus, FileText, Settings, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminStats = [
    { title: "Total Students", value: "1,420", sub: "+120 this semester", icon: Users, color: "bg-[#2563EB]/10 text-[#2563EB]" },
    { title: "Faculty Members", value: "84 Staff", sub: "12 Departments", icon: School, color: "bg-[#14B8A6]/10 text-[#14B8A6]" },
    { title: "Active Courses", value: "36 Programs", sub: "Semester 1, 3, 5", icon: BookOpen, color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    { title: "System Uptime", value: "99.98%", sub: "Zero Downtime", icon: Activity, color: "bg-[#22C55E]/10 text-[#22C55E]" },
  ];

  const recentLogs = [
    { id: 1, action: "Student Record Created", user: "Admin (System)", target: "STU2026109 (Rohan Verma)", time: "10 mins ago" },
    { id: 2, action: "Faculty Permissions Granted", user: "Super Admin", target: "Dr. Ananya Sharma (CS Dept)", time: "45 mins ago" },
    { id: 3, action: "OTP Service Gateway Health", user: "Automated Check", target: "SMS Gateway Operational", time: "2 hours ago" },
    { id: 4, action: "Semester 3 Marks Approved", user: "Academic Dean", target: "Department of MCA", time: "5 hours ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Hero Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#2563EB] to-[#14B8A6] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Institutional Administration Gateway
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            EduConnect Administration Control Center
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Global Configuration • Security Governance • Database Operations
          </p>
        </div>

        <div className="z-10 flex gap-3">
          <Button
            variant="accent"
            onClick={() => navigate("/admin/users")}
            icon={UserPlus}
            className="text-xs shadow-md"
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, idx) => {
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

      {/* Quick Action Grid & System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Audit Trail */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">System Audit & Event Logs</h2>
              <p className="text-xs text-[#64748B]">Real-time operational activity log</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{log.action}</h4>
                    <p className="text-[11px] text-[#64748B]">
                      By: <span className="font-medium text-[#1E293B]">{log.user}</span> • Target: <span className="font-mono text-[#2563EB]">{log.target}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Admin Controls */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-3">Administrative Controls</h2>
          
          <Button
            variant="primary"
            onClick={() => navigate("/admin/users")}
            icon={UserPlus}
            className="w-full text-xs"
          >
            Add New Student / Faculty
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/admin/courses")}
            icon={BookOpen}
            className="w-full text-xs"
          >
            Create Course Module
          </Button>

          <Button
            variant="outline"
            onClick={() => alert("Backup Triggered Successfully!")}
            icon={Settings}
            className="w-full text-xs"
          >
            Trigger System Data Backup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
