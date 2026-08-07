import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpenCheck,
  Award,
  User,
  Users,
  School,
  FileSpreadsheet,
  Megaphone,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";
import logoImg from "../../assets/logo/logo.png";

const Sidebar = ({ role = "Student" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = {
    Student: [
      { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      { label: "Attendance", path: "/student/attendance", icon: CalendarCheck },
      { label: "Assignments", path: "/student/assignments", icon: BookOpenCheck },
      { label: "Exam Results", path: "/student/results", icon: Award },
      { label: "My Profile", path: "/student/profile", icon: User },
    ],
    Teacher: [
      { label: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
      { label: "Mark Attendance", path: "/teacher/attendance", icon: CalendarCheck },
      { label: "Grade Book", path: "/teacher/grades", icon: FileSpreadsheet },
      { label: "Notices & Announcements", path: "/teacher/notices", icon: Megaphone },
      { label: "Class Timetable", path: "/teacher/schedule", icon: BookOpenCheck },
    ],
    Admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User Directory", path: "/admin/users", icon: Users },
      { label: "Faculty Roster", path: "/admin/faculty", icon: School },
      { label: "Course Management", path: "/admin/courses", icon: BookOpenCheck },
      { label: "System Reports", path: "/admin/reports", icon: BarChart3 },
    ],
  };

  const currentNav = navItems[role] || navItems.Student;

  const roleAccent = {
    Student: "bg-[#2563EB] text-white shadow-blue-500/20",
    Teacher: "bg-[#14B8A6] text-white shadow-teal-500/20",
    Admin: "bg-[#F59E0B] text-white shadow-amber-500/20",
  };

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col justify-between sticky top-0 h-screen z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E2E8F0]">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="EduConnect Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="block text-[10px] tracking-wider uppercase font-extrabold text-[#14B8A6]">
                {role} Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <div className="px-4 py-6">
          <p className="px-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
            Portal Navigation
          </p>
          <nav className="space-y-1.5">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                    ${
                      isActive
                        ? `${roleAccent[role]} shadow-md`
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#64748B]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info & Sign Out */}
      <div className="p-4 border-t border-[#E2E8F0] space-y-3">
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            Academic Term 2026
          </div>
          <p className="text-[11px] text-[#64748B]">Semester 3 • Active</p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-[#EF4444] font-semibold rounded-xl hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
