import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  School,
  Building2,
  FolderTree,
  BarChart3,
  CalendarRange,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    activeInstitutes: 0,
    activePrograms: 0,
    activeBatches: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, instRes, progRes, batchRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getInstitutes(),
          adminApi.getPrograms(),
          adminApi.getBatches(),
        ]);
        setStatsData({
          totalStudents:
            dashRes?.totalStudents ||
            (Array.isArray(dashRes?.students) ? dashRes.students.length : 0),
          totalFaculty:
            dashRes?.totalFaculty ||
            (Array.isArray(dashRes?.faculty) ? dashRes.faculty.length : 0),
          activeInstitutes: Array.isArray(instRes) ? instRes.length : 0,
          activePrograms: Array.isArray(progRes) ? progRes.length : 0,
          activeBatches: Array.isArray(batchRes) ? batchRes.length : 0,
        });
      } catch (err) {
        console.log("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const adminStats = [
    {
      title: "Academic Batches",
      value: `${statsData.activeBatches} Batches`,
      icon: CalendarRange,
      color: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
    {
      title: "Active Institutes",
      value: `${statsData.activeInstitutes} Institutes`,
      icon: Building2,
      color: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    {
      title: "Academic Departments",
      value: `${statsData.activePrograms} Departments`,
      icon: FolderTree,
      color: "bg-[#22C55E]/10 text-[#22C55E]",
    },
    {
      title: "Total Students",
      value: `${statsData.totalStudents} Active`,
      icon: Users,
      color: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    {
      title: "Faculty Members",
      value: `${statsData.totalFaculty} Professors`,
      icon: School,
      color: "bg-[#14B8A6]/10 text-[#14B8A6]",
    },
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
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-semibold text-[#64748B]">
                  {stat.title}
                </h3>
              </div>
              <p className="text-xl font-bold text-[#1E293B]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                Institutes & Schools
              </h3>
              <p className="text-xs text-[#64748B]">
                Manage CA, CS, IT schools
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => navigate("/admin/institutes")}
            className="text-xs"
          >
            Manage Institutes
          </Button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                Academic Departments
              </h3>
              <p className="text-xs text-[#64748B]">Manage MCA, BCA, Terms</p>
            </div>
          </div>
          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => navigate("/admin/departments")}
            className="text-xs"
          >
            Manage Departments
          </Button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                Academic Batches
              </h3>
              <p className="text-xs text-[#64748B]">
                Manage batch sessions & active batch
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => navigate("/admin/batches")}
            className="text-xs"
          >
            Manage Batches
          </Button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                Institutional Reports
              </h3>
              <p className="text-xs text-[#64748B]">
                Generate attendance & marks
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => navigate("/admin/reports")}
            className="text-xs"
          >
            Generate Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
