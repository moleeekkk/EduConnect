import React, { useState, useEffect } from "react";
import { School, Users, CalendarCheck, FileSpreadsheet, Plus, ArrowRight, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;

  const [dashData, setDashData] = useState({
    faculty_id: loggedUser?.identifier || "",
    first_name: loggedUser?.name ? loggedUser.name.split(" ")[0] : "Faculty",
    last_name: loggedUser?.name && loggedUser.name.split(" ").length > 1 ? loggedUser.name.split(" ").slice(1).join(" ") : "Member",
    designation: "Assistant Professor",
    qualification: "Faculty",
    experience: 0,
    sessions: [],
    assigned_courses_count: 0,
    assigned_subject_codes: "",
    assignments_count: 0,
    attendance_rate: "0%",
    total_students_count: 0,
    profile_photo: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const identifier = loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;

      try {
        const [dashRes, profileRes] = await Promise.all([
          teacherApi.getDashboard(identifier),
          teacherApi.getProfile(identifier),
        ]);

        let merged = { ...dashData };
        if (profileRes && (profileRes.first_name || profileRes.email)) {
          merged = { ...merged, ...profileRes };
        }
        if (dashRes && typeof dashRes === "object") {
          merged = { ...merged, ...dashRes };
          if (Array.isArray(dashRes.sessions)) {
            merged.sessions = dashRes.sessions;
          }
        }
        setDashData(merged);
      } catch (err) {
        console.error("Teacher dashboard load error:", err);
      }
    };
    fetchData();
  }, []);

  const teacher = {
    faculty_id: dashData.faculty_id || dashData.facultyId || "",
    first_name: dashData.first_name || "Faculty",
    last_name: dashData.last_name || "Member",
    designation: dashData.designation || "Assistant Professor",
    qualification: dashData.qualification || "Faculty",
    experience: dashData.experience || 0,
    profile_photo: dashData.profile_photo || dashData.profilePhoto || "",
  };

  const assignedCount = dashData.assigned_courses_count || dashData.assignedCoursesCount || (dashData.sessions ? dashData.sessions.length : 0);
  const assignmentsCount = dashData.assignments_count || dashData.assignmentsCount || 0;
  const totalStudents = dashData.total_students_count || dashData.totalStudents || 0;
  const attendanceRate = dashData.attendance_rate || dashData.attendanceRate || "95.0%";
  const subjectCodes = dashData.assigned_subject_codes || "Active Courses";

  const teacherStats = [
    { title: "Assigned Courses", value: `${assignedCount} Subject${assignedCount === 1 ? "" : "s"}`, icon: BookOpen, color: "bg-[#14B8A6]/10 text-[#14B8A6]" },
    { title: "Teaching Experience", value: `${teacher.experience} Years`, icon: School, color: "bg-[#2563EB]/10 text-[#2563EB]" },
    { title: "Active Assignments", value: `${assignmentsCount} Uploaded`, icon: FileSpreadsheet, color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    { title: "Average Class Attendance", value: attendanceRate, icon: CalendarCheck, color: "bg-[#22C55E]/10 text-[#22C55E]" },
  ];

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="bg-gradient-to-r from-[#14B8A6] to-[#2563EB] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {teacher.first_name} {teacher.last_name}!
            </h1>
            <p className="text-white/80 text-xs mt-1">
              {teacher.designation} • {teacher.qualification} {teacher.faculty_id ? `(${teacher.faculty_id})` : ""}
            </p>
          </div>
        </div>

      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teacherStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xs font-medium text-[#64748B]">{stat.title}</h3>
              <p className="text-xl font-bold text-[#1E293B] mt-0.5">{stat.value}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default TeacherDashboard;
