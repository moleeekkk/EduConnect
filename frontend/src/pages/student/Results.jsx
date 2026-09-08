import React, { useState, useEffect } from "react";
import { Award, ArrowLeft, CheckCircle2, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { studentApi } from "../../services/api";

const StudentResults = () => {
  const navigate = useNavigate();
  const [selectedSemId, setSelectedSemId] = useState("sem-003");
  const [semesters, setSemesters] = useState([
    { semester_id: "sem-001", semester_number: 1 },
    { semester_id: "sem-002", semester_number: 2 },
    { semester_id: "sem-003", semester_number: 3 },
  ]);
  const [currentResult, setCurrentResult] = useState(null);
  const [resultDetails, setResultDetails] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await studentApi.getResults();
        if (data) {
          if (data.result) setCurrentResult(data.result);
          if (Array.isArray(data.details)) setResultDetails(data.details);
          if (Array.isArray(data.semesters)) setSemesters(data.semesters);
        }
      } catch (err) {
        console.error("Student results load error:", err);
      }
    };
    fetchResults();
  }, [selectedSemId]);

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
            Official Academic Record • Master of Computer Applications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSemId}
            onChange={(e) => setSelectedSemId(e.target.value)}
            className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
          >
            {semesters.map((sem) => (
              <option key={sem.semester_id} value={sem.semester_id}>
                Semester {sem.semester_number}
              </option>
            ))}
          </select>
          <div className="px-4 py-2 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-center">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Cumulative CGPA</span>
            <span className="text-xl font-extrabold text-[#2563EB]">{currentResult?.cgpa || "8.97"} / 10</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B]">Semester SGPA</span>
          <p className="text-2xl font-extrabold text-[#2563EB] mt-1">{currentResult?.sgpa || "9.15"} / 10</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B]">Result Status</span>
          <p className="text-2xl font-extrabold text-[#22C55E] mt-1">{currentResult?.result_status || "Pass"}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-[#64748B]">Published Date</span>
          <p className="text-2xl font-extrabold text-[#14B8A6] mt-1">{currentResult?.published_date || "2026-08-01"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1E293B]">Subject-Wise Marksheet Breakdown</h2>
          <span className="text-xs text-[#22C55E] font-bold">SGPA: {currentResult?.sgpa}</span>
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
              {resultDetails.map((sub) => (
                <tr key={sub.semester_result_detail_id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-5 font-bold text-[#2563EB]">{sub.subj.subject_code}</td>
                  <td className="py-4 px-5 font-medium">{sub.subj.subject_name}</td>
                  <td className="py-4 px-5 font-mono">{sub.subj.credits}</td>
                  <td className="py-4 px-5 font-bold">{sub.obtained_marks} / {sub.total_marks}</td>
                  <td className="py-4 px-5 font-bold text-[#14B8A6]">{sub.grade}</td>
                  <td className="py-4 px-5 font-bold">{sub.points}</td>
                  <td className="py-4 px-5 text-[#64748B]">{sub.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
