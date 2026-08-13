import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Sparkles, GraduationCap, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({
  role = "Student",
  userName,
  userDetail,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onToggleMobile = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;
  const displayName = loggedUser?.name || userName || (role === "Admin" ? "Super Administrator" : role === "Teacher" ? "Faculty Member" : "Student User");
  const displayDetail = loggedUser?.identifier || userDetail || (role === "Admin" ? "admin@educonnect.ac.in" : "");

  // Automatically close dropdown when user clicks another module or navigates
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  // Click outside listener to close dropdown when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const roleColors = {
    Student: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20",
    Teacher: "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20",
    Admin: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-3">
      {/* Left Menu Controls & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors cursor-pointer shrink-0"
          title="Open Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Expand/Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" /> : <PanelLeftClose className="w-4 h-4 text-[#64748B]" />}
        </button>

        {/* Search Input Container */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, schedules..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder-[#64748B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${roleColors[role] || roleColors.Student}`}>
          <Sparkles className="w-3 h-3" />
          {role} Account
        </span>

        {/* User Profile Menu Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {displayName ? displayName.split(" ").map((n) => n[0]).join("") : "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#1E293B] leading-tight">{displayName}</p>
              <p className="text-[10px] text-[#64748B]">{displayDetail}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {/* User Menu Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-50 animate-fade-in">
              <div className="p-2 border-b border-[#E2E8F0] mb-1">
                <p className="text-xs font-bold text-[#1E293B]">{displayName}</p>
                <p className="text-[10px] text-[#64748B]">{role} Portal</p>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/");
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] font-medium rounded-xl hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
