import React, { useState, useEffect } from "react";
import { CheckSquare, Calendar, Award, Clock, FileText, CheckCircle2 } from "lucide-react";
import { studentApi } from "../../services/api";

const StudentWeeklyTests = () => {
  const [weeklyTests, setWeeklyTests] = useState([]);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.enrollment_no || loggedUser?.enrollmentNo || loggedUser?.identifier || "";

      try {
        const data = await studentApi.getWeeklyTests(enrollmentNo);
        if (Array.isArray(data)) {
          setWeeklyTests(data);
        } else if (data && Array.isArray(data.tests)) {
          setWeeklyTests(data.tests);
          if (Array.isArray(data.results)) setTestResults(data.results);
        } else if (data && Array.isArray(data.exams)) {
          setWeeklyTests(data.exams);
          if (Array.isArray(data.results)) setTestResults(data.results);
        }
      } catch (err) {
        console.error("Weekly tests load error:", err);
      }
    };
    fetchTests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Weekly Tests</h1>
          <p className="text-xs text-[#64748B] mt-0.5">View your cohort test schedules and published evaluation results.</p>
        </div>
      </div>

      {/* Weekly Tests Reference Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {weeklyTests.map((test) => {
          const testId = test.weekly_test_id || test.weekly_exam_id || test.id;
          const testDate = test.test_date || test.exam_date;
          const result = testResults.find((r) => String(r.weekly_test_id || r.weekly_exam_id) === String(testId));
          const isPublished = Boolean(test.is_published);

          return (
            <div key={testId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-[11px]">
                      Test Date: {testDate}
                    </span>
                    {test.subject_name && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#1E293B] font-bold text-[11px]">
                        {test.subject_code ? `${test.subject_code}` : test.subject_name}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[#64748B] text-[11px] font-medium">{test.start_time} - {test.end_time}</span>
                </div>

                <h3 className="text-sm font-bold text-[#1E293B]">{test.title}</h3>
                <p className="text-[#64748B]">{test.description}</p>

                <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
                  <span className="font-bold text-[#14B8A6]">Total Marks: {test.total_marks}</span>
                  {test.subject_name && <span className="text-[11px] text-[#64748B] font-medium">{test.subject_name}</span>}
                </div>
              </div>

              {/* Result Summary View */}
              {result && result.obtained_marks !== null && result.obtained_marks !== undefined ? (
                <div className="p-3 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#22C55E] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated Score: {result.obtained_marks} / {test.total_marks}
                    </span>
                    <span className="font-extrabold text-[#22C55E]">Grade: {result.grade}</span>
                  </div>
                  {result.remarks && <p className="text-[11px] text-[#64748B]">Remarks: {result.remarks}</p>}
                </div>
              ) : (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] flex items-center justify-between">
                  <span>Evaluation Status: {isPublished ? "Evaluated / Grade Pending" : "Scheduled / Draft Evaluation"}</span>
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-[#1E293B] font-bold text-[10px]">
                    {isPublished ? "Published" : "Pending"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentWeeklyTests;
