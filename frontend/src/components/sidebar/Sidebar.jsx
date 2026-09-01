import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpenCheck,
  Award,
  User,
  UserCheck,
  Users,
  School,
  FileSpreadsheet,
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
  ChevronLeft,
  ChevronRight,
  X,
  CalendarRange,
  Layers,
} from "lucide-react";
import logoImg from "../../assets/logo/logo.png";

const Sidebar = ({
  role = "Student",
  isCollapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  onCloseMobile = () => {},
}) => {
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
      { label: "Institute Management", path: "/admin/institutes", icon: Building2 },
      { label: "Department Management", path: "/admin/departments", icon: FolderTree },
      { label: "Semesters Management", path: "/admin/semesters", icon: Layers },
      { label: "Batches Management", path: "/admin/batches", icon: CalendarRange },
      { label: "Teacher Management", path: "/admin/teachers", icon: School },
      { label: "Student Management", path: "/admin/students", icon: GraduationCap },
      { label: "Subject Management", path: "/admin/subjects", icon: BookOpen },
      { label: "Subject Allocation", path: "/admin/teacher-subjects", icon: UserCheck },
      { label: "Reports", path: "/admin/reports", icon: BarChart3 },
      { label: "My Profile", path: "/admin/profile", icon: User },
    ],
  };

  const currentNav = navItems[role] || navItems.Student;

  const roleAccent = {
    Student: "bg-[#2563EB] text-white shadow-blue-500/20",
    Teacher: "bg-[#14B8A6] text-white shadow-teal-500/20",
    Admin: "bg-[#F59E0B] text-white shadow-amber-500/20",
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        className={`
          bg-white border-r border-[#E2E8F0] flex flex-col justify-between z-40
          transition-all duration-300 ease-in-out
          
          /* Mobile Drawer (fixed off-canvas) */
          fixed inset-y-0 left-0 h-full w-64 shadow-2xl lg:shadow-none
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Desktop Sidebar (fixed height, stays in place) */
          lg:translate-x-0 lg:static lg:h-screen lg:shrink-0
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 border-b border-[#E2E8F0] shrink-0 flex items-center justify-between min-h-[64px]">
            <Link
              to="/"
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden"
              title="EduConnect"
            >
              <img
                src={logoImg}
                alt="EduConnect Logo"
                className={`h-12 w-auto object-contain transition-all shrink-0 ${isCollapsed ? "lg:h-10" : ""}`}
              />
              {!isCollapsed && (
                <div className="hidden lg:block truncate">
                  <span className="block text-[10px] tracking-wider uppercase font-extrabold text-[#14B8A6]">
                    {role} Portal
                  </span>
                </div>
              )}
              {/* Mobile text label */}
              <div className="lg:hidden truncate">
                <span className="block text-[10px] tracking-wider uppercase font-extrabold text-[#14B8A6]">
                  {role} Portal
                </span>
              </div>
            </Link>

            {/* Desktop Expand / Collapse Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation List */}
          <div className="px-3 py-4 overflow-y-auto flex-1 custom-scrollbar">
            {(!isCollapsed || isMobileOpen) && (
              <p className="px-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 transition-opacity">
                Portal Activities
              </p>
            )}
            <nav className="space-y-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : ""}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                      ${isCollapsed ? "lg:justify-center lg:px-2" : ""}
                      ${isActive
                        ? `${roleAccent[role]} shadow-sm`
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#64748B]"}`} />
                    {!isCollapsed && <span className="truncate hidden lg:inline">{item.label}</span>}
                    <span className="truncate lg:hidden">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Info & Sign Out */}
          <div className="p-3 border-t border-[#E2E8F0] space-y-2 shrink-0 bg-white">
            {(!isCollapsed || isMobileOpen) && role === "Student" && (
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hidden lg:block">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Academic Term 2026
                </div>
                <p className="text-[11px] text-[#64748B]">Semester 3 • Active</p>
              </div>
            )}

            <button
              onClick={() => {
                onCloseMobile();
                navigate("/");
              }}
              title={isCollapsed ? "Sign Out" : ""}
              className={`
                w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-[#EF4444] font-semibold rounded-xl hover:bg-[#EF4444]/10 transition-colors cursor-pointer
                ${isCollapsed ? "lg:px-2" : ""}
              `}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="hidden lg:inline">Sign Out</span>}
              <span className="lg:hidden">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
