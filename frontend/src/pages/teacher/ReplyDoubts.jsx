import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Clock, Edit, AlertCircle, X } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherReplyDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const doubtsData = await teacherApi.getDoubts();
      setDoubts(Array.isArray(doubtsData) ? doubtsData : []);
    } catch (err) {
      console.error("Reply doubts load error:", err);
      notifyError("Failed to load assigned student doubts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleOpenReplyModal = (doubt) => {
    setSelectedDoubt(doubt);
    setReplyText(doubt.reply || "");
    setErrorMsg("");
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedDoubt) return;

    if (!replyText.trim()) {
      setErrorMsg("Reply explanation cannot be blank.");
      notifyError("Reply explanation cannot be blank.");
      return;
    }

    const dId = selectedDoubt.doubt_id || selectedDoubt.id;

    try {
      setSubmitting(true);
      setErrorMsg("");
      await teacherApi.replyDoubt(dId, replyText.trim());

      notifySuccess("Reply submitted and saved to database successfully!");
      setSelectedDoubt(null);
      setReplyText("");
      await fetchDoubts();
    } catch (err) {
      console.error("Send reply error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to submit reply.";
      setErrorMsg(msg);
      notifyError(`Failed to send reply: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Student Doubts & Mentorship Replies</h1>
          <p className="text-xs text-[#64748B] mt-0.5">View student queries for your subject allocations and provide faculty answers.</p>
        </div>
      </div>

      {/* Doubts Feed */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
          Loading student doubts...
        </div>
      ) : doubts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-[#64748B] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#1E293B]">No Student Doubts Found</h3>
          <p className="text-xs text-[#64748B]">There are no pending or submitted doubts for your active subject allocations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => {
            const dId = doubt.doubt_id || doubt.id;
            const isAnswered = doubt.status === "Answered" || !!doubt.reply;
            const studentName = doubt.student_name || "Student";
            const enrollmentNo = doubt.enrollment_no || "";

            return (
              <div key={dId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2563EB]">
                      Student: {studentName} {enrollmentNo ? `(${enrollmentNo})` : ""}
                    </span>
                    {doubt.subject_code && (
                      <span className="font-mono text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        {doubt.subject_code}
                      </span>
                    )}
                  </div>
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
                  <h3 className="text-sm font-bold text-[#1E293B]">{doubt.title}</h3>
                  <p className="text-[#64748B] leading-relaxed">{doubt.description}</p>
                </div>

                {doubt.reply ? (
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#14B8A6]">
                      <span>Your Reply:</span>
                      {doubt.replied_at && (
                        <span className="text-[10px] text-[#64748B] font-mono">{doubt.replied_at}</span>
                      )}
                    </div>
                    <p className="text-[#1E293B] leading-relaxed">{doubt.reply}</p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleOpenReplyModal(doubt)}
                        className="text-[11px] font-semibold text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[11px] text-[#F59E0B] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Pending response
                    </span>
                    <Button
                      variant="accent"
                      size="sm"
                      icon={Send}
                      onClick={() => handleOpenReplyModal(doubt)}
                      className="text-xs"
                    >
                      Reply To Student
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#1E293B]">
                {selectedDoubt.reply ? "Edit Reply To Student" : "Reply To Student Doubt"}
              </h3>
              <button
                onClick={() => setSelectedDoubt(null)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <p className="font-bold text-[#2563EB]">{selectedDoubt.title}</p>
              <p className="text-[#64748B] line-clamp-3">{selectedDoubt.description}</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Faculty Explanation / Answer</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide detailed answer and guidance..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedDoubt(null)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" icon={Send} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Reply"}
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
