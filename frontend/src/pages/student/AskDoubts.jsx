import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Plus, Clock, BookOpen, UserCheck, HelpCircle, Edit3 } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const StudentAskDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDoubt, setEditingDoubt] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDoubts = async () => {
    try {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.identifier || loggedUser?.enrollmentNo || "2024MCA001";

      const [doubtsData, subjectsData] = await Promise.all([
        studentApi.getDoubts(enrollmentNo),
        studentApi.getSubjects(enrollmentNo),
      ]);

      const dList = Array.isArray(doubtsData) ? doubtsData : [];
      const sList = Array.isArray(subjectsData) ? subjectsData : [];

      setDoubts(dList);
      setSubjects(sList);

      if (sList.length > 0 && !selectedSubject) {
        const initialSubj = sList[0].subject_name || sList[0].name || "";
        setSelectedSubject(initialSubj);
      }
    } catch (err) {
      console.error("Doubts load error:", err);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleOpenNewModal = () => {
    setEditingDoubt(null);
    setNewTitle("");
    setNewDesc("");
    if (subjects.length > 0) {
      setSelectedSubject(subjects[0].subject_name || subjects[0].name || "");
    }
    setShowModal(true);
  };

  const handleEditClick = (doubt) => {
    setEditingDoubt(doubt);
    const subj = doubt.subject_name || doubt.subjectName || (subjects.length > 0 ? (subjects[0].subject_name || subjects[0].name) : "");
    setSelectedSubject(subj);
    const title = doubt.title || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":")[0] : doubt.question) || "";
    const desc = doubt.description || (doubt.question && doubt.question.includes(":") ? doubt.question.split(":").slice(1).join(":") : doubt.question) || "";
    setNewTitle(title);
    setNewDesc(desc);
    setShowModal(true);
  };

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      notifyError("Please select a subject from your current semester.");
      return;
    }
    if (!newTitle.trim() || !newDesc.trim()) {
      notifyError("Please enter both title and description for your doubt.");
      return;
    }

    setSubmitting(true);
    try {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.identifier || loggedUser?.enrollmentNo || "2024MCA001";
      const studentId = loggedUser?.studentId || loggedUser?.student_id || loggedUser?.id || loggedUser?.identifier || "";

      const payload = {
        student_id: studentId,
        studentId: studentId,
        subject_name: selectedSubject,
        subjectName: selectedSubject,
        title: newTitle,
        description: newDesc,
        question: `${newTitle}: ${newDesc}`,
        teacher_subject_id: "ts-001",
      };

      if (editingDoubt) {
        const doubtId = editingDoubt.doubt_id || editingDoubt.id;
        const res = await studentApi.updateDoubt(doubtId, payload);
        const updatedObj = (res && (res.doubt_id || res.id)) ? res : {
          ...editingDoubt,
          subject_name: selectedSubject,
          subjectName: selectedSubject,
          title: newTitle,
          description: newDesc,
          question: `${newTitle}: ${newDesc}`,
        };

        setDoubts(
          doubts.map((d) => {
            const currentId = d.doubt_id || d.id;
            if (currentId === doubtId) {
              return updatedObj;
            }
            return d;
          })
        );
        notifySuccess("Doubt updated successfully!");
      } else {
        const res = await studentApi.askDoubt(payload, enrollmentNo);
        const createdObj = (res && (res.doubt_id || res.id)) ? res : {
          doubt_id: `doubt-00${doubts.length + 1}`,
          student_id: res?.student_id || studentId || "stu-001",
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
        setSuccessMsg(true);
        notifySuccess("Doubt submitted to teacher successfully!");
        setTimeout(() => setSuccessMsg(false), 3000);
      }

      setShowModal(false);
      setEditingDoubt(null);
      setNewTitle("");
      setNewDesc("");
    } catch (err) {
      console.error("Save doubt error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save doubt.";
      notifyError(`Failed to save doubt: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = doubts.filter(d => d.status !== "Answered" && !d.reply && !d.answer).length;
  const answeredCount = doubts.filter(d => d.status === "Answered" || Boolean(d.reply || d.answer)).length;

  const filteredDoubts = doubts.filter(d => {
    const isAns = d.status === "Answered" || Boolean(d.reply || d.answer);
    if (statusFilter === "pending") return !isAns;
    if (statusFilter === "answered") return isAns;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Ask Doubts</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Submit your academic queries for current semester subjects to your faculty</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenNewModal} className="text-xs">
          Ask New Doubt
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Doubt posted to faculty and saved to database!
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "bg-[#2563EB] text-white shadow-xs"
              : "bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
          }`}
        >
          All ({doubts.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "pending"
              ? "bg-[#F59E0B] text-white shadow-xs"
              : "bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("answered")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "answered"
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
          <p className="font-bold text-sm text-[#1E293B]">No Doubts Found</p>
          <p>
            {statusFilter === "all"
              ? "Click 'Ask New Doubt' to submit a question to your faculty mentor."
              : `There are currently no ${statusFilter} doubts.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoubts.map((doubt, index) => {
            const doubtId = doubt.doubt_id || doubt.id || `doubt-idx-${index}`;
            const subjName = doubt.subject_name || doubt.subjectName || "Subject";
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
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2563EB]/10 text-[#2563EB] text-[11px] font-semibold truncate max-w-[170px]">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">{subjName}</span>
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isAnswered
                          ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                          : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                      }`}
                    >
                      {isAnswered ? "Answered" : "Pending"}
                    </span>
                  </div>

                  {/* Doubt Content */}
                  <div className="space-y-1.5 text-xs">
                    <h3 className="text-sm font-bold text-[#1E293B] line-clamp-2 leading-snug">{doubtTitle}</h3>
                    {doubtDesc && <p className="text-[#64748B] line-clamp-3 leading-relaxed">{doubtDesc}</p>}
                  </div>
                </div>

                {/* Faculty Reply Section & Edit Button */}
                <div className="space-y-3">
                  {isAnswered && replyText ? (
                    <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[#0D9488]">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{doubt.replied_by || doubt.repliedBy || "Faculty Mentor"}</span>
                        </span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          {doubt.replied_at || doubt.updated_at || "Answered"}
                        </span>
                      </div>
                      <p className="text-[#334155] leading-relaxed">{replyText}</p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-[#F59E0B]/5 rounded-lg border border-[#F59E0B]/15 text-xs text-[#D97706] font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Awaiting response from faculty mentor.</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => handleEditClick(doubt)}
                      className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Doubt
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              {editingDoubt ? <Edit3 className="w-5 h-5 text-[#2563EB]" /> : <HelpCircle className="w-5 h-5 text-[#2563EB]" />}
              <h3 className="text-base font-bold text-[#1E293B]">
                {editingDoubt ? "Edit Doubt Details" : "Ask Doubt to Teacher"}
              </h3>
            </div>

            <form onSubmit={handlePostDoubt} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#475569] mb-1">
                  Target Subject <span className="text-xs font-normal text-[#64748B]">(Current Semester)</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  {subjects.length === 0 ? (
                    <option value="">No subjects found for current semester</option>
                  ) : (
                    subjects.map((s, idx) => {
                      const sName = s.subject_name || s.name || s.title || "";
                      const sCode = s.subject_code || s.code || "";
                      return (
                        <option key={s.subject_id || s.id || idx} value={sName}>
                          {sName} {sCode ? `(${sCode})` : ""}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#475569] mb-1">Doubt Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Clarification on state management concept..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#475569] mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your query or error details in depth..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => { setShowModal(false); setEditingDoubt(null); }}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" loading={submitting} icon={Send}>
                  {editingDoubt ? "Save Changes" : "Submit Doubt"}
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


