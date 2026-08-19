import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockSemesters } from "../../data/mockData";

const StudentResults = () => {
  const navigate = useNavigate();
  const [selectedSemId, setSelectedSemId] = useState(mockSemesters && mockSemesters.length > 0 ? mockSemesters[0].semester_id : "sem-001");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/student/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1E293B]">Semester Examination Results</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 ml-7">
            Official Academic Record
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSemId}
            onChange={(e) => setSelectedSemId(e.target.value)}
            className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
          >
            {mockSemesters && mockSemesters.length > 0 ? (
              mockSemesters.map((sem) => (
                <option key={sem.semester_id} value={sem.semester_id}>
                  Semester {sem.semester_number}
                </option>
              ))
            ) : (
              <option value="sem-001">Semester 1</option>
            )}
          </select>
          <div className="px-4 py-2 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-center">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Cumulative CGPA</span>
            <span className="text-xl font-extrabold text-[#2563EB]">0.0 / 10</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B]">Semester SGPA</span>
          <p className="text-2xl font-extrabold text-[#2563EB] mt-1">0.0 / 10</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B]">Result Status</span>
          <p className="text-2xl font-extrabold text-slate-500 mt-1">N/A</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B]">Published Date</span>
          <p className="text-2xl font-extrabold text-slate-500 mt-1">N/A</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1E293B]">Subject-Wise Marksheet Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-5">Subject Title</th>
                <th className="py-3.5 px-5">Credits</th>
                <th className="py-3.5 px-5">Obtained / Total Marks</th>
                <th className="py-3.5 px-5">Grade</th>
                <th className="py-3.5 px-5">Grade Points</th>
                <th className="py-3.5 px-5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#1E293B]">
              <tr>
                <td colSpan={7} className="py-6 px-5 text-center text-xs text-[#64748B]">
                  No examination results published yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
