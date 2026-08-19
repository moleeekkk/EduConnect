import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import {
  mockSemesters,
  mockSubjects,
} from "../../data/mockData";

const StudentMarksheet = () => {
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;
  const currentStudentId = loggedUser?.userId || loggedUser?.identifier || "";

  const [selectedSemId, setSelectedSemId] = useState(mockSemesters && mockSemesters.length > 0 ? mockSemesters[0].semester_id : "sem-001");

  return (
    <div className="space-y-6">
      {/* Header with Semester Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Marksheet</h1>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#64748B]">Select Term:</label>
          <select
            value={selectedSemId}
            onChange={(e) => setSelectedSemId(e.target.value)}
            className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
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
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold">
        No official semester result published yet for the selected term.
      </div>

      {/* Subject-Wise Marks Details Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#1E293B]">Subject-Wise Marks Breakdown</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Subject Code</th>
                <th className="p-3.5">Subject Name</th>
                <th className="p-3.5">Credits</th>
                <th className="p-3.5">Obtained Marks</th>
                <th className="p-3.5">Total Marks</th>
                <th className="p-3.5">Percentage</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              <tr>
                <td colSpan={8} className="p-6 text-center text-xs text-[#64748B]">
                  No marksheet records available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentMarksheet;
