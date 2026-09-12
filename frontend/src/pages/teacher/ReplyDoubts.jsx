import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherReplyDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doubtsData, stuData] = await Promise.all([
          teacherApi.getDoubts(),
          teacherApi.getStudents(),
        ]);
        setDoubts(Array.isArray(doubtsData) ? doubtsData : []);
        setStudents(Array.isArray(stuData) ? stuData : []);
      } catch (err) {
        console.error("Reply doubts load error:", err);
      }
    };
    fetchData();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedDoubt) return;

    const doubtId = selectedDoubt.doubt_id || selectedDoubt.id;
    try {
      await teacherApi.replyDoubt(doubtId, replyText);
      setDoubts(
        doubts.map((d) => {
          const currentId = d.doubt_id || d.id;
          if (currentId === doubtId) {
            return {
              ...d,
              reply: replyText,
              answer: replyText,
              replied_at: new Date().toISOString().split("T")[0],
              status: "Answered",
            };
          }
          return d;
        })
      );
      notifySuccess("Reply sent to student and saved to database successfully!");
      setSelectedDoubt(null);
      setReplyText("");
    } catch (err) {
      console.error("Send reply error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to send reply.";
      notifyError(`Failed to send reply: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Reply Student Doubts</h1>
          <p className="text-xs text-[#64748B]">Review and answer questions submitted by students</p>
        </div>
      </div>

      <div className="space-y-4">
        {doubts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="font-bold text-sm text-[#1E293B]">No Student Doubts Found</p>
            <p>All student questions have been answered or no doubts have been submitted yet.</p>
          </div>
        ) : (
          doubts.map((doubt, index) => {
            const doubtId = doubt.doubt_id || doubt.id || `teacher-doubt-${index}`;
            const student = students.find((s) => s.student_id === doubt.student_id || s.id === doubt.student_id);
            const studentDisplayName = doubt.student_name || (student ? `${student.first_name} ${student.last_name}` : "Alex Johnson");
            const enrollment = doubt.enrollment_no || (student ? student.enrollment_no : "2024MCA001");
            const doubtTitle = doubt.title || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":")[0] : doubt.question) || "Academic Question";
            const doubtDesc = doubt.description || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":").slice(1).join(":") : doubt.question) || "";
            const replyText = doubt.reply || doubt.answer;
            const isAnswered = doubt.status === "Answered" || Boolean(replyText);

            return (
              <div key={doubtId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs">
                  <span className="font-bold text-[#2563EB]">
                    Student: {studentDisplayName} ({enrollment}) • <span className="text-[#64748B]">{doubt.subject_name || "MCA"}</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAnswered
                        ? "bg-[#22C55E]/10 text-[#22C55E]"
                        : "bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    {isAnswered ? "Answered" : "Pending"}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <h3 className="text-sm font-bold text-[#1E293B]">{doubtTitle}</h3>
                  {doubtDesc && <p className="text-[#64748B]">{doubtDesc}</p>}
                </div>

                {isAnswered && replyText ? (
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#14B8A6]">
                      <span>Your Reply:</span>
                      <span className="text-[10px] text-[#64748B] font-mono">{doubt.replied_at || doubt.updated_at || "Recently"}</span>
                    </div>
                    <p className="text-[#1E293B]">{replyText}</p>
                  </div>
                ) : (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="accent"
                      size="sm"
                      icon={Send}
                      onClick={() => {
                        setSelectedDoubt(doubt);
                        setReplyText("");
                      }}
                      className="text-xs"
                    >
                      Reply To Student
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reply Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Reply To Student Doubt
            </h3>

            <div className="text-xs space-y-1 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              <p className="font-bold text-[#2563EB]">{selectedDoubt.title || selectedDoubt.question}</p>
              {selectedDoubt.description && <p className="text-[#64748B]">{selectedDoubt.description}</p>}
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Faculty Explanation / Solution</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type clear explanation or solution code..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedDoubt(null)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" icon={Send}>
                  Submit Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherReplyDoubts;
