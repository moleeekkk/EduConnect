import React, { useState, useEffect } from "react";
import { Mail, Send, CheckCircle2, User, Phone, AtSign, Users, Database } from "lucide-react";
import Button from "../../components/common/Button";
import { mockStudents } from "../../data/mockData";

const TeacherParentEmail = () => {
  const [sendMode, setSendMode] = useState("single");
  const [selectedStudent, setSelectedStudent] = useState(
    mockStudents && mockStudents.length > 0 ? mockStudents[0] : null
  );
  const [emailType, setEmailType] = useState("Attendance Report");
  const [customSubject, setCustomSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  useEffect(() => {
    if (sendMode === "single" && selectedStudent) {
      const studentName = `${selectedStudent.first_name || ""} ${selectedStudent.last_name || ""}`;
      const enroll = selectedStudent.enrollment_no || "";

      setCustomSubject(`[EduConnect] Official Notice - ${studentName} (${enroll})`);
      setMessageBody(
        `Dear Parent (${selectedStudent.parent_name || ""}),\n\nThis is an official communication regarding your ward ${studentName} (${enroll}).`
      );
    } else if (sendMode === "all") {
      const totalStudents = (mockStudents || []).length;
      setCustomSubject(`[EduConnect Class Broadcast] Class Notice (${totalStudents} Students)`);
      setMessageBody(
        `Dear Parents & Guardians,\n\nThis is an official broadcast email regarding MCA student schedules.`
      );
    }
  }, [sendMode, selectedStudent, emailType]);

  const handleSendEmail = (e) => {
    e.preventDefault();
    setBatchCount(sendMode === "all" ? (mockStudents || []).length : 1);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Parent Email</h1>
        </div>

        <div className="inline-flex rounded-lg border border-[#E2E8F0] p-1 bg-[#F8FAFC]">
          <button
            onClick={() => setSendMode("single")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              sendMode === "single" ? "bg-[#2563EB] text-white" : "text-[#64748B]"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Single Student
          </button>
          <button
            onClick={() => setSendMode("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              sendMode === "all" ? "bg-[#14B8A6] text-white shadow-xs" : "text-[#64748B]"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Send to All Students
          </button>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">
              {sendMode === "all"
                ? `Batch Email Sent to ALL ${batchCount} Students & Parents!`
                : `Email Dispatched to ${selectedStudent?.parent_name || "Parent"}!`}
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
          {sendMode === "single" ? (
            <>
              <h2 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                Class Student Roster ({(mockStudents || []).length})
              </h2>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {mockStudents && mockStudents.length > 0 ? (
                  mockStudents.map((stu) => {
                    const isSelected = selectedStudent?.student_id === stu.student_id;
                    return (
                      <div
                        key={stu.student_id}
                        onClick={() => setSelectedStudent(stu)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? "bg-[#2563EB]/10 border-[#2563EB]"
                            : "bg-[#F8FAFC] border-[#E2E8F0]"
                        }`}
                      >
                        <div className="truncate">
                          <p className={`font-bold ${isSelected ? "text-[#2563EB]" : "text-[#1E293B]"}`}>
                            {stu.first_name} {stu.last_name}
                          </p>
                          <p className="text-[10px] text-[#64748B] font-mono">{stu.enrollment_no}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-[#64748B]">
                    No students available in roster.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#14B8A6] font-bold text-sm">
                <Users className="w-5 h-5" /> Batch Mode Active
              </div>
              <p className="text-[#1E293B] font-medium leading-relaxed">
                Broadcasting to <strong className="text-[#14B8A6]">{(mockStudents || []).length} Students & Parents</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-5">
          {selectedStudent ? (
            <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Notification Category</label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#1E293B]"
                >
                  <option value="Attendance Report">Attendance Record Summary</option>
                  <option value="Semester Marksheet">Semester Marksheet</option>
                  <option value="General Academic Notice">General Academic Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Email Subject Line</label>
                <input
                  type="text"
                  required
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Email Content</label>
                <textarea
                  rows={7}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
                <Button variant="accent" size="sm" type="submit" icon={Send} className="text-xs">
                  Send Email Notification
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No student selected for email dispatch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherParentEmail;
