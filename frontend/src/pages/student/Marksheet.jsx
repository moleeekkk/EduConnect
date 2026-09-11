import React, { useState, useEffect } from "react";
import { Award, CheckCircle, FileSpreadsheet, Calendar, BookOpen } from "lucide-react";
import { studentApi } from "../../services/api";

const StudentMarksheet = () => {
  const [selectedSemId, setSelectedSemId] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [resultDetails, setResultDetails] = useState([]);
  const [weeklyResults, setWeeklyResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resData = await studentApi.getMarksheet(selectedSemId);
        if (resData) {
          if (Array.isArray(resData.semesters) && resData.semesters.length > 0) {
            setSemesters(resData.semesters);
            if (!selectedSemId) {
              setSelectedSemId(resData.selectedSemesterId || resData.semesters[0].semester_id);
            }
          }
          setCurrentResult(resData.result || null);
          setResultDetails(Array.isArray(resData.details) ? resData.details : []);
          setWeeklyResults(Array.isArray(resData.weeklyResults) ? resData.weeklyResults : []);
        }
      } catch (err) {
        console.error("Marksheet load error:", err);
        setCurrentResult(null);
        setResultDetails([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSemId]);

  const currentSem = semesters.find((s) => s.semester_id === selectedSemId || s.id === selectedSemId);

  return (
    <div className="space-y-6">
      {/* Header with Semester Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Marksheet & Results</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Official published academic transcripts and SGPA/CGPA breakdown</p>
        </div>

        {semesters.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#64748B]">Select Term:</label>
            <select
              value={selectedSemId}
              onChange={(e) => setSelectedSemId(e.target.value)}
              className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
            >
              {semesters.map((sem) => (
                <option key={sem.semester_id || sem.id} value={sem.semester_id || sem.id}>
                  Semester {sem.semester_number} {sem.semester_name ? `(${sem.semester_name})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary Score Card: SGPA & CGPA */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
          Loading semester result data...
        </div>
      ) : currentResult ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs text-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">Semester SGPA</span>
            <p className="text-3xl font-extrabold text-[#2563EB] mt-1">
              {currentResult.sgpa} <span className="text-xs font-normal text-[#64748B]">/ 10.0</span>
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs text-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">Cumulative CGPA</span>
            <p className="text-3xl font-extrabold text-[#14B8A6] mt-1">
              {currentResult.cgpa} <span className="text-xs font-normal text-[#64748B]">/ 10.0</span>
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs text-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">Final Result Status</span>
            <p className={`text-3xl font-extrabold mt-1 ${
              currentResult.result_status === "PASS" ? "text-[#22C55E]" : "text-[#EF4444]"
            }`}>
              {currentResult.result_status}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold flex items-center justify-between">
          <span>No official semester result published yet for the selected term.</span>
          <span className="text-[10px] uppercase font-bold bg-[#F59E0B]/20 px-2 py-0.5 rounded-full">
            Pending Admin Publication
          </span>
        </div>
      )}

      {/* Subject-Wise Marks Details Table */}
      {resultDetails.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-[#1E293B]">Subject-Wise Marks Breakdown</h2>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded-full">
              Semester {currentSem?.semester_number || 1}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Subject Code</th>
                  <th className="p-3.5">Subject Name</th>
                  <th className="p-3.5">Credits</th>
                  <th className="p-3.5">Internal</th>
                  <th className="p-3.5">External</th>
                  <th className="p-3.5">Obtained Marks</th>
                  <th className="p-3.5">Total Marks</th>
                  <th className="p-3.5">Percentage</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {resultDetails.map((det, idx) => {
                  const code = det.subj?.subject_code || det.subject_code || "-";
                  const name = det.subj?.subject_name || det.subject_name || "Subject";
                  const credits = det.subj?.credits || det.credits || 4;
                  return (
                    <tr key={det.semester_result_detail_id || det.detail_id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">{code}</td>
                      <td className="p-3.5 font-semibold text-[#1E293B]">{name}</td>
                      <td className="p-3.5 font-bold text-[#14B8A6]">{credits} Credits</td>
                      <td className="p-3.5 text-[#64748B] font-mono">{det.internal_marks || "0.00"}</td>
                      <td className="p-3.5 text-[#64748B] font-mono">{det.external_marks || "0.00"}</td>
                      <td className="p-3.5 font-bold text-sm text-[#1E293B]">{det.obtained_marks}</td>
                      <td className="p-3.5 text-[#64748B]">{det.total_marks}</td>
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">{det.percentage}%</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-extrabold text-xs ${
                          det.grade === "F" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#22C55E]/10 text-[#22C55E]"
                        }`}>
                          {det.grade}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#64748B] font-medium">{det.remarks || (det.result_status || "Passed")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly Test Results Section */}
      {weeklyResults.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-bold text-[#1E293B]">Weekly Test Exam Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Exam Date</th>
                  <th className="p-3.5">Test Title</th>
                  <th className="p-3.5">Obtained Marks</th>
                  <th className="p-3.5">Total Marks</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {weeklyResults.map((wer, idx) => (
                  <tr key={wer.weekly_test_result_id || wer.weekly_exam_result_id || idx} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-mono text-[#64748B]">
                      {wer.test?.test_date || wer.test?.exam_date || wer.exam?.exam_date || wer.exam?.test_date || "-"}
                    </td>
                    <td className="p-3.5 font-bold text-[#1E293B]">{wer.test?.title || wer.exam?.title || "Weekly Test"}</td>
                    <td className="p-3.5 font-bold text-[#2563EB]">{wer.obtained_marks}</td>
                    <td className="p-3.5 text-[#64748B]">{wer.test?.total_marks || wer.exam?.total_marks || 25}</td>
                    <td className="p-3.5 font-extrabold text-[#22C55E]">{wer.grade || "P"}</td>
                    <td className="p-3.5 text-[#64748B]">{wer.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMarksheet;
