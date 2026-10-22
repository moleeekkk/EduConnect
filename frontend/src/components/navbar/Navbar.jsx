import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Sparkles, GraduationCap, Menu, PanelLeftClose, PanelLeftOpen, CalendarRange, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBatch } from "../../context/BatchContext";
import { adminApi, teacherApi, studentApi } from "../../services/api";

const Navbar = ({
  role = "Student",
  userName,
  userDetail,
  isCollapsed = false,
  onToggleCollapse = () => { },
  onToggleMobile = () => { },
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { batches, selectedBatch, setSelectedBatch } = useBatch();

  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;
  const [userProfile, setUserProfile] = useState(null);

  const [profilePhoto, setProfilePhoto] = useState(
    loggedUser?.profile_photo || loggedUser?.profilePhoto || loggedUser?.avatar || ""
  );

  // Fetch admin, teacher or student profile photo & details on mount & listen for profile updates
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const logged = userStr ? JSON.parse(userStr) : null;
      const identifier = logged?.identifier || logged?.email || logged?.userId;

      try {
        if (role === "Admin") {
          const data = await adminApi.getProfile();
          if (data) {
            setUserProfile(data);
            if (data.profile_photo || data.profilePhoto) {
              setProfilePhoto(data.profile_photo || data.profilePhoto);
            }
          }
        } else if (role === "Teacher") {
          const data = await teacherApi.getProfile(identifier);
          if (data && (data.first_name || data.email)) {
            setUserProfile(data);
            if (data.profile_photo || data.profilePhoto) {
              setProfilePhoto(data.profile_photo || data.profilePhoto);
            }
          }
        } else if (role === "Student") {
          const data = await studentApi.getProfile(identifier);
          if (data && (data.first_name || data.email || data.enrollment_no)) {
            setUserProfile(data);
            if (data.profile_photo || data.profilePhoto) {
              setProfilePhoto(data.profile_photo || data.profilePhoto);
            }
          }
        }
      } catch (e) {
        console.error("Navbar profile fetch error:", e);
      }
    };

    fetchUserProfile();

    const handleProfileUpdate = () => {
      fetchUserProfile();
      const updatedUserStr = localStorage.getItem("educonnect_user");
      if (updatedUserStr) {
        try {
          const parsed = JSON.parse(updatedUserStr);
          if (parsed?.profile_photo || parsed?.profilePhoto) {
            setProfilePhoto(parsed.profile_photo || parsed.profilePhoto);
          }
        } catch (ignored) { }
      }
    };

    window.addEventListener("profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile_updated", handleProfileUpdate);
    };
  }, [role]);

  const displayName = userProfile?.first_name
    ? `${userProfile.first_name} ${userProfile.last_name || ""}`.trim()
    : loggedUser?.name || userName || (role === "Admin" ? "Super Administrator" : role === "Teacher" ? "Faculty Member" : "Student User");

  const displayDetail = role === "Teacher" && (userProfile?.faculty_id || userProfile?.designation)
    ? `${userProfile.faculty_id || ""} ${userProfile.designation ? "• " + userProfile.designation : ""}`.trim()
    : loggedUser?.identifier || userDetail || userProfile?.email || (role === "Admin" ? "System Admin" : "");

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
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Batch Selector Dropdown */}
        {(role === "Admin" || role === "Teacher") && batches && batches.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]">
            <CalendarRange className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[11px] text-[#64748B] font-medium hidden lg:inline">Active Batch:</span>
            <select
              value={selectedBatch?.batch_id || selectedBatch?.batchId || ""}
              onChange={(e) => {
                const found = batches.find(
                  (b) => (b.batch_id || b.batchId) === e.target.value
                );
                if (found) setSelectedBatch(found);
              }}
              className="bg-transparent text-xs font-bold text-[#1E293B] focus:outline-none cursor-pointer pr-1"
            >
              {batches.map((b) => {
                const bId = b.batch_id || b.batchId;
                const bName = b.batch_name || b.batchName;
                return (
                  <option key={bId} value={bId}>
                    {bName}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${roleColors[role] || roleColors.Student}`}>
          {role} Account
        </span>

        {/* User Profile Menu Container */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-full  transition-colors cursor-pointer border border-transparent"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 overflow-hidden border border-[#E2E8F0]">
              {profilePhoto && profilePhoto.trim() !== "" ? (
                <img
                  src={profilePhoto}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : null}
              {(!profilePhoto || profilePhoto.trim() === "") && (
                <span>
                  {displayName ? displayName.split(" ").map((n) => n[0]).join("") : "U"}
                </span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#1E293B] leading-tight">{displayName}</p>
              <p className="text-[10px] text-[#64748B]">{displayDetail}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
