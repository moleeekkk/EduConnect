import React, { useState } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Sparkles, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ role = "Student", userName = "Alex Johnson", userDetail = "2024MCA001" }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleColors = {
    Student: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20",
    Teacher: "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20",
    Admin: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  };

  const notifications = [
    { id: 1, title: "Mid-Term Timetable Released", time: "10m ago", read: false },
    { id: 2, title: "Attendance updated for Advanced Web Tech", time: "1h ago", read: false },
    { id: 3, title: "Assignment #3 Grade Posted", time: "1d ago", read: true },
  ];

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, exams, announcements..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder-[#64748B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${roleColors[role] || roleColors.Student}`}>
          <Sparkles className="w-3 h-3" />
          {role} Account
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0]/50 text-[#1E293B] flex items-center justify-center relative transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#EF4444] absolute top-2 right-2 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-[#EF4444] absolute top-2 right-2" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-2">
                <h4 className="text-xs font-bold text-[#1E293B]">Notifications</h4>
                <span className="text-[10px] text-[#2563EB] font-semibold">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0]">
                    <p className="text-xs font-medium text-[#1E293B]">{n.title}</p>
                    <span className="text-[10px] text-[#64748B] mt-0.5 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#1E293B] leading-tight">{userName}</p>
              <p className="text-[10px] text-[#64748B]">{userDetail}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {/* User Menu Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-50">
              <div className="p-2 border-b border-[#E2E8F0] mb-1">
                <p className="text-xs font-bold text-[#1E293B]">{userName}</p>
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
