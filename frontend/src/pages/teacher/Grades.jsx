import React, { useState, useEffect } from "react";
import { FileSpreadsheet, ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";

const TeacherGrades = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await teacherApi.getPendingGrades();
        const cleaned = (Array.isArray(data) ? data : []).filter((s) => {
          const email = (s.email || "").toLowerCase();
          const fullName = (s.studentName || `${s.first_name || ""} ${s.last_name || ""}`).toLowerCase();
          return email !== "alex.johnson@educonnect.ac.in" && !fullName.includes("alex johnson");
        });
        setSubmissions(cleaned);
      } catch (err) {
        setSubmissions([]);
      }
    };
    fetchGrades();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <button onClick={() => navigate("/teacher/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Grade Book & Evaluation</h1>
          <p className="text-xs text-[#64748B]">Review student lab submissions and enter marks</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1E293B]">MCA Semester 3 Submissions</span>
          <span className="text-xs font-mono text-[#64748B]">3 Submissions</span>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {submissions.map((sub) => (
            <div key={sub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#2563EB]">{sub.enrollmentNo}</span>
                <h4 className="text-sm font-bold text-[#1E293B]">{sub.studentName}</h4>
                <p className="text-xs text-[#64748B] mt-0.5">{sub.assignmentTitle} (Max: {sub.totalMarks})</p>
              </div>

              <div className="flex items-center gap-3">
                {sub.status === 'Graded' ? (
                  <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold">
                    Score: {sub.obtainedMarks} / {sub.totalMarks}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Marks"
                      className="w-20 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-center font-bold"
                    />
                    <Button variant="secondary" size="sm" icon={Save} className="text-xs">
                      Grade
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherGrades;
