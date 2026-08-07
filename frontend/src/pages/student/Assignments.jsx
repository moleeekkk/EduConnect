import React, { useState, useEffect } from "react";
import { BookOpenCheck, Upload, CheckCircle2, Clock, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await studentApi.getAssignments("2024MCA001");
        setAssignments(data);
      } catch (err) {
        // Fallback static data
        setAssignments([
          { id: "ASG-101", subject: "Advanced Web Technologies", title: "React 19 Hooks & State Management", dueDate: "12-AUG-2026", marks: "50", status: "Pending" },
          { id: "ASG-102", subject: "Cloud Infrastructure", title: "Docker Containerization & Kubernetes", dueDate: "15-AUG-2026", marks: "100", status: "Submitted" },
          { id: "ASG-103", subject: "Database Architecture", title: "PostgreSQL Indexing & Optimization", dueDate: "05-AUG-2026", marks: "50", status: "Graded", obtainedMarks: 46 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/student/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1E293B]">Course Assignments</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 ml-7">
            Submit lab reports, assignments, and view teacher feedback & marks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assignments.map((asg) => (
          <div key={asg.id} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#2563EB] transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                  {asg.subject}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  asg.status === 'Graded' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                  asg.status === 'Submitted' ? 'bg-[#14B8A6]/10 text-[#14B8A6]' :
                  'bg-[#F97316]/10 text-[#F97316]'
                }`}>
                  {asg.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1E293B] mb-2">{asg.title}</h3>
              <p className="text-xs text-[#64748B] mb-4">Max Marks: <strong className="text-[#1E293B]">{asg.marks}</strong></p>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-xs text-[#64748B] mb-3">
                <span>Due Date:</span>
                <strong className="text-[#1E293B] font-mono">{asg.dueDate}</strong>
              </div>
              {asg.status === 'Graded' ? (
                <div className="p-2.5 rounded-xl bg-[#22C55E]/10 text-center text-xs text-[#22C55E] font-bold">
                  Obtained: {asg.obtainedMarks} / {asg.marks} Marks
                </div>
              ) : (
                <Button variant={asg.status === 'Submitted' ? 'secondary' : 'primary'} size="sm" icon={Upload} fullWidth className="text-xs">
                  {asg.status === 'Submitted' ? 'Re-upload File' : 'Upload Submission'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignments;
