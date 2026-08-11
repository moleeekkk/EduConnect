import React, { useState } from "react";
import { Send, CheckCircle2, MessageSquare, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { mockDoubts, mockStudents } from "../../data/mockData";

const TeacherReplyDoubts = () => {
  const [doubts, setDoubts] = useState(mockDoubts);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!selectedDoubt) return;

    setDoubts(
      doubts.map((d) =>
        d.doubt_id === selectedDoubt.doubt_id
          ? { ...d, reply: replyText, replied_at: new Date().toISOString(), status: "Answered" }
          : d
      )
    );
    setSelectedDoubt(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Reply Doubts</h1>
        </div>
      </div>

      <div className="space-y-4">
        {doubts.map((doubt) => {
          const student = mockStudents.find((s) => s.student_id === doubt.student_id);
          return (
            <div key={doubt.doubt_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs">
                <span className="font-bold text-[#2563EB]">
                  Student: {student ? `${student.first_name} ${student.last_name} (${student.enrollment_no})` : "Student"}
                </span>
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

              {doubt.reply ? (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#14B8A6]">
                    <span>Your Reply:</span>
                    <span className="text-[10px] text-[#64748B] font-mono">{doubt.replied_at}</span>
                  </div>
                  <p className="text-[#1E293B]">{doubt.reply}</p>
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
        })}
      </div>

      {/* Reply Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Reply To Doubt
            </h3>

            <div className="text-xs space-y-1">
              <p className="font-bold text-[#2563EB]">{selectedDoubt.title}</p>
              <p className="text-[#64748B]">{selectedDoubt.description}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1">Enter Explanation / Answer (reply)</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide detailed answer..."
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
