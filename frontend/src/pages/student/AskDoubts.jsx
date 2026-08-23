import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Plus, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentAskDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doubtsData, syllabusData] = await Promise.all([
          studentApi.getDoubts(),
          studentApi.getSyllabus(),
        ]);
        setDoubts(Array.isArray(doubtsData) ? doubtsData : []);
        setSubjects(Array.isArray(syllabusData) ? syllabusData : []);
      } catch (err) {
        console.error("Doubts load error:", err);
      }
    };
    fetchData();
  }, []);

  const handlePostDoubt = (e) => {
    e.preventDefault();
    const created = {
      doubt_id: `doubt-00${doubts.length + 1}`,
      student_id: "stu-001",
      teacher_subject_id: "ts-001",
      title: newTitle,
      description: newDesc,
      reply: null,
      replied_at: null,
      status: "Pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDoubts([created, ...doubts]);
    setShowModal(false);
    setNewTitle("");
    setNewDesc("");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Ask Doubts</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={() => setShowModal(true)} className="text-xs">
          Ask New Doubt
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Doubt posted to faculty!
        </div>
      )}

      {/* Doubts Feed */}
      <div className="space-y-4">
        {doubts.map((doubt) => (
          <div key={doubt.doubt_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs">
              <span className="font-bold text-[#2563EB]">Advanced Web Technologies</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  doubt.status === "Answered"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "bg-[#F59E0B]/10 text-[#F59E0B]"
                }`}
              >
                {doubt.status}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold text-[#1E293B]">{doubt.title}</h3>
              <p className="text-[#64748B]">{doubt.description}</p>
            </div>

            {/* Teacher Reply */}
            {doubt.reply ? (
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[#14B8A6]">
                  <span>Faculty Reply (Dr. Sarah Jenkins):</span>
                  <span className="text-[10px] text-[#64748B] font-mono">{doubt.replied_at}</span>
                </div>
                <p className="text-[#1E293B]">{doubt.reply}</p>
              </div>
            ) : (
              <div className="p-2.5 bg-[#F59E0B]/10 rounded-lg text-xs text-[#F59E0B] font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> Awaiting response from faculty mentor.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Post Question To Teacher (doubts)
            </h3>

            <form onSubmit={handlePostDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#64748B] mb-1">Target Subject</label>
                <select className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  {subjects.map((s) => (
                    <option key={s.subject_id || s.id || s.code} value={s.subject_id || s.id}>
                      {s.subject_name || s.name} ({s.subject_code || s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#64748B] mb-1">Doubt Title (title)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Question on React Context state..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#64748B] mb-1">Detailed Description (description)</label>
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
                <Button variant="accent" size="sm" type="submit" icon={Send}>
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
