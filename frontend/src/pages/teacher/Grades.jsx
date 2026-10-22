import React, { useState, useEffect } from "react";
import { FileSpreadsheet, ArrowLeft, CheckCircle2, Save, Loader2, CalendarRange } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";
import { useBatch } from "../../context/BatchContext";

const TeacherGrades = () => {
  const navigate = useNavigate();
  const { selectedBatch, batches } = useBatch();
  const activeBatch = selectedBatch || batches.find((b) => b.is_active === true || b.isActive === true) || batches[0];
  const activeBatchId = activeBatch ? String(activeBatch.batch_id || activeBatch.batchId || activeBatch.id) : null;
  const batchName = activeBatch?.batch_name || activeBatch?.name || "Active Batch";

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeInputs, setGradeInputs] = useState({});
  const [gradingId, setGradingId] = useState(null);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const identifier = loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;

      const data = await teacherApi.getPendingGrades(identifier);
      const list = Array.isArray(data) ? data : [];
      setSubmissions(list);

      const initialInputs = {};
      list.forEach((sub) => {
        const id = sub.submission_id || sub.submissionId || sub.id;
        initialInputs[id] = sub.obtained_marks ?? sub.obtainedMarks ?? "";
      });
      setGradeInputs(initialInputs);
    } catch (err) {
      console.error("Fetch pending grades error:", err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleInputChange = (subId, val) => {
    setGradeInputs((prev) => ({ ...prev, [subId]: val }));
  };

  const handleGradeSubmit = async (sub) => {
    const subId = sub.submission_id || sub.submissionId || sub.id;
    const score = gradeInputs[subId];

    if (score === undefined || score === "" || isNaN(Number(score))) {
      notifyError("Please enter valid numerical marks.");
      return;
    }

    setGradingId(subId);
    try {
      if (subId && !String(subId).startsWith("sub-missing-")) {
        await teacherApi.gradeSubmission(subId, {
          obtained_marks: Number(score),
          feedback: "Graded by Faculty",
        });
      } else {
        await teacherApi.submitGrades({
          submission_id: subId,
          obtained_marks: Number(score),
          student_id: sub.student_id || sub.studentId,
        });
      }

      setSubmissions((prev) =>
        prev.map((s) => {
          const currentId = s.submission_id || s.submissionId || s.id;
          if (currentId === subId) {
            return {
              ...s,
              status: "Graded",
              obtainedMarks: Number(score),
              obtained_marks: Number(score),
            };
          }
          return s;
        })
      );
      notifySuccess(`Grade (${score} marks) recorded for ${sub.studentName || sub.student_name || "Student"}!`);
    } catch (err) {
      console.error("Error submitting grade:", err);
      notifyError("Failed to save grade to database.");
    } finally {
      setGradingId(null);
    }
  };

  const batchSubmissions = submissions.filter((sub) => {
    if (!activeBatchId) return true;
    if (sub.batch_id) return String(sub.batch_id) === activeBatchId;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <button onClick={() => navigate("/teacher/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E293B]">Grade Book & Evaluation</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
              <CalendarRange className="w-3.5 h-3.5" />
              Batch: {batchName} ({batchSubmissions.length} submissions)
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Review student lab submissions and enter marks for {batchName}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1E293B]">Submissions for {batchName}</span>
          <span className="text-xs font-mono text-[#64748B]">Total: {batchSubmissions.length} Submissions</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#64748B] text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" /> Loading pending grades from database...
          </div>
        ) : batchSubmissions.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] text-xs space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="font-semibold text-sm text-[#1E293B]">No Submissions Needing Grading</p>
            <p>No student submissions requiring grading for {batchName}.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {batchSubmissions.map((sub, index) => {
              const subId = sub.submission_id || sub.submissionId || sub.id || `sub-index-${index}`;
              const enrollment = sub.enrollmentNo || sub.enrollment_no || "25CI2110016";
              const studentName = sub.studentName || sub.student_name || "Student";
              const assignmentTitle = sub.assignmentTitle || sub.assignment_title || sub.title || "Laboratory Assignment";
              const totalMarks = sub.totalMarks || sub.total_marks || 50;
              const isGraded = sub.status === "Graded" || sub.submission_status === "Graded" || sub.obtainedMarks !== undefined && sub.obtainedMarks !== null;
              const obtainedMarks = sub.obtainedMarks ?? sub.obtained_marks;

              return (
                <div key={subId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC]">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#2563EB]">{enrollment}</span>
                    <h4 className="text-sm font-bold text-[#1E293B]">{studentName}</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">{assignmentTitle} (Max: {totalMarks})</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isGraded ? (
                      <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Score: {obtainedMarks} / {totalMarks}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Marks"
                          min="0"
                          max={totalMarks}
                          value={gradeInputs[subId] ?? ""}
                          onChange={(e) => handleInputChange(subId, e.target.value)}
                          className="w-20 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-center font-bold"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Save}
                          loading={gradingId === subId}
                          onClick={() => handleGradeSubmit(sub)}
                          className="text-xs"
                        >
                          Grade
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherGrades;

