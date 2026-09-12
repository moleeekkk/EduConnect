import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Plus, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const StudentAskDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Advanced Web Technologies");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDoubts = async () => {
    try {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.identifier || loggedUser?.enrollmentNo || "2024MCA001";

      const [doubtsData, syllabusData] = await Promise.all([
        studentApi.getDoubts(enrollmentNo),
        studentApi.getSyllabus(),
      ]);
      setDoubts(Array.isArray(doubtsData) ? doubtsData : []);
      setSubjects(Array.isArray(syllabusData) ? syllabusData : []);
    } catch (err) {
      console.error("Doubts load error:", err);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      notifyError("Please enter both title and description for your doubt.");
      return;
    }

    setSubmitting(true);
    try {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.identifier || loggedUser?.enrollmentNo || "2024MCA001";

      const payload = {
        subject_name: selectedSubject,
        subjectName: selectedSubject,
        title: newTitle,
        description: newDesc,
        question: `${newTitle}: ${newDesc}`,
        teacher_subject_id: "ts-001",
      };

      const res = await studentApi.askDoubt(payload, enrollmentNo);
      const createdObj = (res && (res.doubt_id || res.id)) ? res : {
        doubt_id: `doubt-00${doubts.length + 1}`,
        student_id: "stu-001",
        teacher_subject_id: "ts-001",
        subject_name: selectedSubject,
        title: newTitle,
        description: newDesc,
        question: `${newTitle}: ${newDesc}`,
        reply: null,
        answer: null,
        status: "Pending",
        created_at: new Date().toISOString(),
      };

      setDoubts([createdObj, ...doubts]);
      setShowModal(false);
      setNewTitle("");
      setNewDesc("");
      setSuccessMsg(true);
      notifySuccess("Doubt submitted to teacher and saved to database successfully!");
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error("Post doubt error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to submit doubt.";
      notifyError(`Failed to submit doubt: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Ask Doubts</h1>
          <p className="text-xs text-[#64748B]">Post academic questions directly to subject teachers</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={() => setShowModal(true)} className="text-xs">
          Ask New Doubt
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Doubt posted to faculty and saved to database!
        </div>
      )}

      {/* Doubts Feed */}
      <div className="space-y-4">
        {doubts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="font-bold text-sm text-[#1E293B]">No Doubts Posted Yet</p>
            <p>Click 'Ask New Doubt' to submit a question to your faculty mentor.</p>
          </div>
        ) : (
          doubts.map((doubt, index) => {
            const doubtId = doubt.doubt_id || doubt.id || `doubt-idx-${index}`;
            const subjName = doubt.subject_name || doubt.subjectName || "Advanced Web Technologies";
            const doubtTitle = doubt.title || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":")[0] : doubt.question) || "Academic Question";
            const doubtDesc = doubt.description || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":").slice(1).join(":") : doubt.question) || "";
            const replyText = doubt.reply || doubt.answer;
            const isAnswered = doubt.status === "Answered" || Boolean(replyText);

            return (
              <div key={doubtId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs">
                  <span className="font-bold text-[#2563EB]">{subjName}</span>
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

                {/* Teacher Reply */}
                {isAnswered && replyText ? (
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#14B8A6]">
                      <span>Faculty Reply ({doubt.replied_by || doubt.repliedBy || "Dr. Sarah Jenkins"}):</span>
                      <span className="text-[10px] text-[#64748B] font-mono">{doubt.replied_at || doubt.updated_at || "Recently"}</span>
                    </div>
                    <p className="text-[#1E293B]">{replyText}</p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#F59E0B]/10 rounded-lg text-xs text-[#F59E0B] font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Awaiting response from faculty mentor.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Post Question To Teacher
            </h3>

            <form onSubmit={handlePostDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#64748B] mb-1">Target Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                >
                  <option value="Advanced Web Technologies">Advanced Web Technologies (MCA301)</option>
                  <option value="Cloud Computing Architecture">Cloud Computing Architecture (MCA302)</option>
                  <option value="Database Security & Admin">Database Security & Admin (MCA303)</option>
                  <option value="Full Stack Development Lab">Full Stack Development Lab (MCA305)</option>
                  {subjects.map((s) => (
                    <option key={s.subject_id || s.id || s.code || s.title} value={s.subject_name || s.name || s.title}>
                      {s.subject_name || s.name || s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#64748B] mb-1">Doubt Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. State management pattern in Custom Hooks..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#64748B] mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your query or error details in depth..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" loading={submitting} icon={Send}>
                  Submit Doubt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAskDoubts;
