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
  Clock,
  BookOpen,
  HelpCircle,
  FileText,
  Building2,
  FolderTree,
  FileQuestion,
  GraduationCap,
  Mail,
  Send,
  SlidersHorizontal,
  CheckSquare,
  BadgeAlert,
  IdCard,
} from "lucide-react";
import logoImg from "../../assets/logo/logo.png";

const Sidebar = ({ role = "Student" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = {
    Student: [
      { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      { label: "My Profile", path: "/student/profile", icon: User },
      { label: "Attendance", path: "/student/attendance", icon: CalendarCheck },
      { label: "MarkSheet & Results", path: "/student/marksheet", icon: Award },
      { label: "Timetable", path: "/student/timetable", icon: Clock },
      { label: "Assignments", path: "/student/assignments", icon: BookOpenCheck },
      { label: "Weekly Tests", path: "/student/weekly-tests", icon: CheckSquare },
      { label: "Quiz Practice", path: "/student/quiz-practice", icon: HelpCircle },
      { label: "Study Material", path: "/student/study-material", icon: FileText },
      { label: "Old Question Paper", path: "/student/old-papers", icon: FileQuestion },
      { label: "Digital ID", path: "/student/digital-id", icon: IdCard },
      { label: "Leave Request", path: "/student/leave-request", icon: BadgeAlert },
      { label: "Ask Doubts", path: "/student/doubts", icon: Send },
    ],
    Teacher: [
      { label: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
      { label: "My Profile", path: "/teacher/profile", icon: User },
      { label: "Manage Students", path: "/teacher/students", icon: Users },
      { label: "Mark Attendance", path: "/teacher/attendance", icon: CalendarCheck },
      { label: "Upload Assignment", path: "/teacher/assignments", icon: BookOpenCheck },
      { label: "Weekly Tests", path: "/teacher/weekly-tests", icon: CheckSquare },
      { label: "Quiz Practice", path: "/teacher/quiz-practice", icon: HelpCircle },
      { label: "Study Material", path: "/teacher/study-material", icon: FileText },
      { label: "Old Question Paper", path: "/teacher/old-papers", icon: FileQuestion },
      { label: "Reply Doubts", path: "/teacher/reply-doubts", icon: Send },
      { label: "Leave Management", path: "/teacher/leave-management", icon: BadgeAlert },
      { label: "Parent Email", path: "/teacher/parent-email", icon: Mail },
    ],
    Admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "My Profile", path: "/admin/profile", icon: User },
      { label: "Student Management", path: "/admin/students", icon: GraduationCap },
      { label: "Teacher Management", path: "/admin/teachers", icon: School },
      { label: "Institute Management", path: "/admin/institutes", icon: Building2 },
      { label: "Department / Program", path: "/admin/programs", icon: FolderTree },
      { label: "Subject Management", path: "/admin/subjects", icon: BookOpen },
      { label: "Reports", path: "/admin/reports", icon: BarChart3 },
      { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
      { label: "System Settings", path: "/admin/settings", icon: SlidersHorizontal },
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
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E2E8F0] shrink-0">
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
        <div className="px-4 py-4 overflow-y-auto flex-1 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Portal Activities
          </p>
          <nav className="space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                    ${
                      isActive
                        ? `${roleAccent[role]} shadow-sm`
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#64748B]"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info & Sign Out */}
        <div className="p-4 border-t border-[#E2E8F0] space-y-2 shrink-0 bg-white">
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] mb-0.5">
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
      </div>
    </aside>
  );
};

export default Sidebar;
