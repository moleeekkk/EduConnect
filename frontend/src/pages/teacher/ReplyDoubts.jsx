import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Clock, User, BookOpen, Edit3, MessageCircle, CalendarRange } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";
import { useBatch } from "../../context/BatchContext";

const TeacherReplyDoubts = () => {
  const { selectedBatch, batches } = useBatch();
  const activeBatch = selectedBatch || batches.find((b) => b.is_active === true || b.isActive === true) || batches[0];
  const activeBatchId = activeBatch ? String(activeBatch.batch_id || activeBatch.batchId || activeBatch.id) : null;
  const batchName = activeBatch?.batch_name || activeBatch?.name || "Active Batch";

  const [doubts, setDoubts] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const teacherName = loggedUser
        ? loggedUser.name || loggedUser.fullName || `${loggedUser.first_name || loggedUser.firstName || ""} ${loggedUser.last_name || loggedUser.lastName || ""}`.trim()
        : "";

      const payload = {
        reply: replyText,
        answer: replyText,
        replied_by: teacherName || "Faculty Member",
        repliedBy: teacherName || "Faculty Member",
        teacher_id: loggedUser?.teacher_id || loggedUser?.teacherId || loggedUser?.id || "",
        email: loggedUser?.email || loggedUser?.identifier || "",
      };

      const res = await teacherApi.replyDoubt(doubtId, payload);
      const savedRepliedBy = res?.replied_by || res?.repliedBy || teacherName || "Faculty Member";

      setDoubts(
        doubts.map((d) => {
          const currentId = d.doubt_id || d.id;
          if (currentId === doubtId) {
            return {
              ...d,
              reply: replyText,
              answer: replyText,
              replied_by: savedRepliedBy,
              repliedBy: savedRepliedBy,
              replied_at: new Date().toISOString().split("T")[0],
              status: "Answered",
            };
          }
          return d;
        })
      );
      notifySuccess("Reply sent to student successfully!");
      setSelectedDoubt(null);
      setReplyText("");
    } catch (err) {
      console.error("Send reply error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to send reply.";
      notifyError(`Failed to send reply: ${msg}`);
    }
  };

  const batchStudents = students.filter(
    (s) => !activeBatchId || String(s.batch_id || s.batchId) === activeBatchId
  );

  const batchDoubts = doubts.filter((d) => {
    if (!activeBatchId) return true;
    if (d.batch_id) return String(d.batch_id) === activeBatchId;
    return batchStudents.some(
      (s) => String(s.student_id || s.id) === String(d.student_id)
    );
  });

  const pendingCount = batchDoubts.filter((d) => d.status !== "Answered" && !d.reply && !d.answer).length;
  const answeredCount = batchDoubts.filter((d) => d.status === "Answered" || Boolean(d.reply || d.answer)).length;

  const filteredDoubts = batchDoubts.filter((doubt) => {
    const isAns = doubt.status === "Answered" || Boolean(doubt.reply || doubt.answer);
    if (statusFilter === "pending") return !isAns;
    if (statusFilter === "answered") return isAns;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#1E293B]">Reply Student Doubts</h1>

          </div>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "all"
            ? "bg-[#2563EB] text-white shadow-xs"
            : "bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
            }`}
        >
          All ({batchDoubts.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "pending"
            ? "bg-[#F59E0B] text-white shadow-xs"
            : "bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
            }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("answered")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "answered"
            ? "bg-[#22C55E] text-white shadow-xs"
            : "bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
            }`}
        >
          Answered ({answeredCount})
        </button>
      </div>

      {/* Doubts Grid Feed */}
      {filteredDoubts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-[#64748B] space-y-3">
          <MessageSquare className="w-10 h-10 text-[#94A3B8] mx-auto opacity-60" />
          <p className="font-bold text-sm text-[#1E293B]">No Student Doubts Found</p>
          <p>
            {statusFilter === "all"
              ? "All student questions have been answered or no doubts have been submitted yet."
              : `There are currently no ${statusFilter} doubts to display.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoubts.map((doubt, index) => {
            const doubtId = doubt.doubt_id || doubt.id || `teacher-doubt-${index}`;
            const student = students.find((s) => s.student_id === doubt.student_id || s.id === doubt.student_id);
            const studentDisplayName = student ? `${student.first_name || ""} ${student.last_name || ""}`.trim() : "Student";
            const enrollment = student ? student.enrollment_no : "";
            const doubtTitle = doubt.title || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":")[0] : doubt.question) || "Academic Question";
            const doubtDesc = doubt.description || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":").slice(1).join(":") : doubt.question) || "";
            const replyText = doubt.reply || doubt.answer;
            const isAnswered = doubt.status === "Answered" || Boolean(replyText);

            return (
              <div
                key={doubtId}
                className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Student & Status Info */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-[#1E293B] truncate">{studentDisplayName}</p>
                        {enrollment && <p className="text-[10px] text-[#64748B] font-mono">{enrollment}</p>}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isAnswered
                        ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                        : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                        }`}
                    >
                      {isAnswered ? "Answered" : "Pending"}
                    </span>
                  </div>

                  {/* Subject Tag */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold">
                      <BookOpen className="w-3 h-3 text-[#2563EB]" />
                      <span>{doubt.subject_name || doubt.subjectName || "General Subject"}</span>
                    </span>
                  </div>

                  {/* Doubt Content */}
                  <div className="space-y-1.5 text-xs">
                    <h3 className="text-sm font-bold text-[#1E293B] line-clamp-2 leading-snug">{doubtTitle}</h3>
                    {doubtDesc && <p className="text-[#64748B] line-clamp-3 leading-relaxed">{doubtDesc}</p>}
                  </div>
                </div>

                {/* Answer or Reply Button */}
                <div className="pt-2 border-t border-[#F1F5F9]">
                  {isAnswered && replyText ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-[#0D9488]">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Your Reply:
                          </span>
                          <span className="text-[10px] text-[#94A3B8] font-mono">
                            {doubt.replied_at || doubt.updated_at || "Answered"}
                          </span>
                        </div>
                        <p className="text-[#334155] leading-relaxed line-clamp-3">{replyText}</p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedDoubt(doubt);
                            setReplyText(replyText || "");
                          }}
                          className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 hover:underline"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#D97706] font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Awaiting response
                      </span>

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
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <MessageCircle className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#1E293B]">
                {selectedDoubt.reply || selectedDoubt.answer ? "Edit Faculty Reply" : "Reply To Student Doubt"}
              </h3>
            </div>

            <div className="text-xs space-y-1 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              <p className="font-bold text-[#2563EB]">{selectedDoubt.title || selectedDoubt.question}</p>
              {selectedDoubt.description && <p className="text-[#64748B]">{selectedDoubt.description}</p>}
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#475569] mb-1 font-semibold">Faculty Explanation / Solution</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type clear explanation or solution for the student..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
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

