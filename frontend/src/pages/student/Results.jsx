import React from "react";
import { Award, ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentResults = () => {
  const navigate = useNavigate();

  const resultsData = {
    sgpa: 8.85,
    cgpa: 8.75,
    totalCredits: 24,
    subjects: [
      { code: "MCA301", name: "Advanced Web Technologies", grade: "A+", points: 9.0, credits: 4 },
      { code: "MCA302", name: "Cloud Infrastructure & DevOps", grade: "A", points: 8.5, credits: 4 },
      { code: "MCA303", name: "Database Architecture Practical", grade: "O", points: 10.0, credits: 3 },
      { code: "MCA304", name: "Software Engineering & Testing", grade: "A", points: 8.0, credits: 4 },
    ]
  };

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
            Official Academic Record • Master of Computer Applications (Semester 3)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-center">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Current CGPA</span>
            <span className="text-xl font-extrabold text-[#2563EB]">{resultsData.cgpa} / 10</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1E293B]">Subject-Wise Marksheet</h2>
          <span className="text-xs text-[#22C55E] font-bold">SGPA: {resultsData.sgpa}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-5">Subject Title</th>
                <th className="py-3.5 px-5">Credits</th>
                <th className="py-3.5 px-5">Grade</th>
                <th className="py-3.5 px-5">Grade Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#1E293B]">
              {resultsData.subjects.map((sub) => (
                <tr key={sub.code} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-5 font-bold text-[#2563EB]">{sub.code}</td>
                  <td className="py-4 px-5 font-medium">{sub.name}</td>
                  <td className="py-4 px-5 font-mono">{sub.credits}</td>
                  <td className="py-4 px-5 font-bold text-[#14B8A6]">{sub.grade}</td>
                  <td className="py-4 px-5 font-bold">{sub.points}</td>
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
