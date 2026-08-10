import React from "react";
import { CheckSquare, Calendar, Award, Clock, FileText } from "lucide-react";
import { mockWeeklyExams, mockWeeklyExamResults } from "../../data/mockData";

const StudentWeeklyTests = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Weekly Tests Schedule & Results (weekly_exams)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Reference listing of conducted weekly tests, total marks, and evaluation scores</p>
        </div>
      </div>

      {/* Weekly Tests Reference Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockWeeklyExams.map((exam) => {
          const result = mockWeeklyExamResults.find((r) => r.weekly_exam_id === exam.weekly_exam_id);
          return (
            <div key={exam.weekly_exam_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-[11px]">
                    Exam Date: {exam.exam_date}
                  </span>
                  <span className="font-mono text-[#64748B] text-[11px]">{exam.start_time} - {exam.end_time}</span>
                </div>

                <h3 className="text-sm font-bold text-[#1E293B]">{exam.title}</h3>
                <p className="text-[#64748B]">{exam.description}</p>
                <div className="pt-1 flex items-center justify-between border-t border-[#E2E8F0]">
                  <span className="font-bold text-[#14B8A6]">Total Marks: {exam.total_marks}</span>
                  <span className="text-[10px] text-[#64748B]">Conducting Mode: Offline Classroom</span>
                </div>
              </div>

              {/* Result Summary View */}
              {result ? (
                <div className="p-3 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#22C55E]">Evaluated Score: {result.obtained_marks} / {exam.total_marks}</span>
                    <span className="font-extrabold text-[#22C55E]">Grade: {result.grade}</span>
                  </div>
                  {result.remarks && <p className="text-[11px] text-[#64748B]">Remarks: {result.remarks}</p>}
                </div>
              ) : (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] flex items-center justify-between">
                  <span>Evaluation Status: Scheduled / Evaluation Pending</span>
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-[#1E293B] font-bold text-[10px]">Reference Only</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Weekly Test Reference Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#1E293B]">Weekly Exams Master Reference Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Exam Date (exam_date)</th>
                <th className="p-3.5">Test Title (title)</th>
                <th className="p-3.5">Exam Timing</th>
                <th className="p-3.5">Total Marks</th>
                <th className="p-3.5">Obtained Score</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {mockWeeklyExams.map((exam) => {
                const result = mockWeeklyExamResults.find((r) => r.weekly_exam_id === exam.weekly_exam_id);
                return (
                  <tr key={exam.weekly_exam_id} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-mono">{exam.exam_date}</td>
                    <td className="p-3.5 font-bold text-[#2563EB]">{exam.title}</td>
                    <td className="p-3.5 font-mono text-[#64748B]">{exam.start_time} - {exam.end_time}</td>
                    <td className="p-3.5 font-bold">{exam.total_marks}</td>
                    <td className="p-3.5 font-bold text-[#2563EB]">{result ? result.obtained_marks : "-"}</td>
                    <td className="p-3.5 font-extrabold text-[#22C55E]">{result ? result.grade : "-"}</td>
                    <td className="p-3.5 text-[#64748B]">{result ? result.remarks : "Pending"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentWeeklyTests;
