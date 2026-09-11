import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Plus, Clock, BookOpen, AlertCircle } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const StudentAskDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDoubtsAndSubjects = async () => {
    try {
      setLoading(true);
      const [doubtsData, syllabusData] = await Promise.all([
        studentApi.getDoubts(),
        studentApi.getSyllabus(),
      ]);

      if (Array.isArray(doubtsData)) {
        setDoubts(doubtsData);
      }
      if (Array.isArray(syllabusData)) {
        setSubjects(syllabusData);
        if (syllabusData.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(syllabusData[0].subject_id || syllabusData[0].id);
        }
      }
    } catch (err) {
      console.error("Doubts load error:", err);
      notifyError("Failed to load doubt history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubtsAndSubjects();
  }, []);

  const handleOpenModal = () => {
    setNewTitle("");
    setNewDesc("");
    setErrorMsg("");
    if (subjects.length > 0) {
      setSelectedSubjectId(subjects[0].subject_id || subjects[0].id);
    }
    setShowModal(true);
  };

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      setErrorMsg("Title and description are required.");
      notifyError("Title and description are required.");
      return;
    }
    if (!selectedSubjectId) {
      setErrorMsg("Please select a target subject.");
      notifyError("Please select a target subject.");
      return;
    }

    try {
      setPosting(true);
      setErrorMsg("");
      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        subject_id: selectedSubjectId,
      };

      await studentApi.askDoubt(payload);
      notifySuccess("Doubt submitted to faculty mentor successfully!");

      setShowModal(false);
      setNewTitle("");
      setNewDesc("");
      await fetchDoubtsAndSubjects();
    } catch (err) {
      console.error("Post doubt error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to submit doubt.";
      setErrorMsg(msg);
      notifyError(`Submission failed: ${msg}`);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Ask Doubts</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Submit queries directly to your subject faculty mentors.</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenModal} className="text-xs">
          Ask New Doubt
        </Button>
      </div>

      {/* Doubts Feed */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
          Loading submitted doubts...
        </div>
      ) : doubts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-[#64748B] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#1E293B]">No Doubts Submitted Yet</h3>
          <p className="text-xs text-[#64748B]">Click "Ask New Doubt" above to post a query for your subject faculty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => {
            const dId = doubt.doubt_id || doubt.id;
            const isAnswered = doubt.status === "Answered" || !!doubt.reply;

            return (
              <div key={dId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded-full text-[11px]">
                      {doubt.subject_code ? `${doubt.subject_code} - ${doubt.subject_name}` : doubt.subject_name || "General"}
                    </span>
                    <span className="text-[11px] text-[#64748B] font-medium">
                      Mentor: {doubt.teacher_name || "Faculty"}
                    </span>
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

                {/* Teacher Reply */}
                {doubt.reply ? (
                  <div className="p-3 bg.emerald-50/50 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#14B8A6]">
                      <span>Faculty Reply ({doubt.teacher_name || "Faculty Mentor"}):</span>
                      {doubt.replied_at && (
                        <span className="text-[10px] text-[#64748B] font-mono">{doubt.replied_at}</span>
                      )}
                    </div>
                    <p className="text-[#1E293B] leading-relaxed">{doubt.reply}</p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#F59E0B]/10 rounded-lg text-xs text-[#F59E0B] font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" /> Awaiting response from faculty mentor.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Post Question To Faculty
            </h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePostDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#64748B] mb-1">Target Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-medium text-[#1E293B]"
                >
                  {subjects.map((s) => (
                    <option key={s.subject_id || s.id || s.code} value={s.subject_id || s.id}>
                      {s.subject_name || s.name} ({s.subject_code || s.code})
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
                  placeholder="e.g. Question on React Context state management..."
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
                  placeholder="Describe your query in detail..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" icon={Send} disabled={posting}>
                  {posting ? "Submitting..." : "Submit Doubt"}
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
