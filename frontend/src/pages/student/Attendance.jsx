import React from "react";
import { CalendarCheck, CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const StudentAttendance = () => {
  const navigate = useNavigate();

  const coursesAttendance = [
    { code: "MCA301", title: "Advanced Web Technologies", total: 40, attended: 36, percentage: 90.0, teacher: "Dr. Sarah Jenkins" },
    { code: "MCA302", title: "Cloud Infrastructure & DevOps", total: 38, attended: 34, percentage: 89.4, teacher: "Prof. Michael Vance" },
    { code: "MCA303", title: "Database Architecture Practical", total: 30, attended: 27, percentage: 90.0, teacher: "Er. Rahul Mehta" },
    { code: "MCA304", title: "Software Engineering & Testing", total: 36, attended: 29, percentage: 80.5, teacher: "Dr. Ananya Sharma" },
    { code: "MCA305", title: "Cyber Security Fundamentals", total: 32, attended: 23, percentage: 71.8, teacher: "Prof. David Miller" },
  ];

  const getStatusBadge = (percentage) => {
    if (percentage >= 85) {
      return <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-[11px] font-bold">Good (&gt;85%)</span>;
    } else if (percentage >= 75) {
      return <span className="px-2.5 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 text-[11px] font-bold">Eligible (75-84%)</span>;
    } else {
      return <span className="px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 text-[11px] font-bold">Shortage (&lt;75%)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/student/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1E293B]">Attendance Summary</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 ml-7">
            Master of Computer Applications • Semester 3 • Required Minimum: 75%
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-center">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Aggregate</span>
            <span className="text-lg font-extrabold text-[#2563EB]">88.5%</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1E293B]">Course-Wise Attendance Record</h2>
          <span className="text-xs text-[#64748B]">Updated Today</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <th className="py-3.5 px-5">Course Code & Name</th>
                <th className="py-3.5 px-5">Faculty</th>
                <th className="py-3.5 px-5">Attended / Total</th>
                <th className="py-3.5 px-5">Percentage</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#1E293B]">
              {coursesAttendance.map((item) => (
                <tr key={item.code} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  <td className="py-4 px-5 font-medium">
                    <span className="font-bold text-[#2563EB] mr-2">{item.code}</span>
                    {item.title}
                  </td>
                  <td className="py-4 px-5 text-[#64748B]">{item.teacher}</td>
                  <td className="py-4 px-5 font-mono font-semibold">
                    {item.attended} / {item.total}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold w-12">{item.percentage}%</span>
                      <div className="w-32 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.percentage >= 85
                              ? "bg-[#22C55E]"
                              : item.percentage >= 75
                              ? "bg-[#2563EB]"
                              : "bg-[#F97316]"
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">{getStatusBadge(item.percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
