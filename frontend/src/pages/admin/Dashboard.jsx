import React, { useState, useEffect } from "react";
import { ShieldCheck, Users, School, BookOpen, Activity, UserPlus, Building2, FolderTree, BarChart3, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { mockInstitutes, mockPrograms } from "../../data/mockData";
import { adminApi } from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    activeCourses: 0,
  });

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      if (res) {
        setStatsData({
          totalStudents: res.totalStudents || 0,
          totalFaculty: res.totalFaculty || 0,
          activeCourses: res.activeCourses || 0,
        });
      }
    }).catch((err) => console.log("Dashboard fetch error:", err));
  }, []);

  const adminStats = [
    { title: "Total Students", value: `${statsData.totalStudents} Active`, sub: "Master of Computer Applications", icon: Users, color: "bg-[#2563EB]/10 text-[#2563EB]" },
    { title: "Faculty Members", value: `${statsData.totalFaculty} Professors`, sub: "Department of CA", icon: School, color: "bg-[#14B8A6]/10 text-[#14B8A6]" },
    { title: "Active Institutes", value: `${mockInstitutes.length} Institutes`, sub: "CA, CS, IT Schools", icon: Building2, color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    { title: "Academic Programs", value: `${mockPrograms.length} Degree Programs`, sub: "MCA, BCA, B.Tech IT", icon: FolderTree, color: "bg-[#22C55E]/10 text-[#22C55E]" },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Hero Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#2563EB] to-[#14B8A6] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            EduConnect Institutional Control Center
          </h1>
          <p className="text-white/80 text-xs mt-1">
            Global Administration • Department Operations • Database Governance
          </p>
        </div>


      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, idx) => {
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

      {/* Quick Navigation Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Institutes & Departments</h3>
              <p className="text-xs text-[#64748B]">Manage CA, CS, IT schools</p>
            </div>
          </div>
          <Button variant="outline" fullWidth size="sm" onClick={() => navigate("/admin/institutes")} className="text-xs">
            Manage Institutes
          </Button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Degree Programs & Batches</h3>
              <p className="text-xs text-[#64748B]">Manage MCA, BCA, Terms</p>
            </div>
          </div>
          <Button variant="outline" fullWidth size="sm" onClick={() => navigate("/admin/programs")} className="text-xs">
            Manage Programs
          </Button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Institutional Reports</h3>
              <p className="text-xs text-[#64748B]">Generate attendance & marks</p>
            </div>
          </div>
          <Button variant="outline" fullWidth size="sm" onClick={() => navigate("/admin/reports")} className="text-xs">
            Generate Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
