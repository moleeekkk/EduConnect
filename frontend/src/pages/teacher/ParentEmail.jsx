import React, { useState, useEffect } from "react";
import { Mail, Send, CheckCircle2, User, Phone, AtSign, Users, Database, AlertCircle, RefreshCw, Eye } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherParentEmail = () => {
  const [sendMode, setSendMode] = useState("single"); // "single" or "all"
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [emailType, setEmailType] = useState("Attendance Report");
  const [customSubject, setCustomSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [previewData, setPreviewData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [sendResult, setSendResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await teacherApi.getStudents();
        if (Array.isArray(data) && data.length > 0) {
          const cleaned = data.filter((s) => {
            const email = (s.email || "").toLowerCase();
            const fullName = `${s.first_name || s.firstName || ""} ${s.last_name || s.lastName || ""}`.toLowerCase();
            return email !== "alex.johnson@educonnect.ac.in" && !fullName.includes("alex johnson");
          });
          setStudents(cleaned);
          if (cleaned.length > 0) {
            setSelectedStudent(cleaned[0]);
          }
        }
      } catch (err) {
        console.error("ParentEmail students load error:", err);
        setError("Failed to load student roster.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch live backend preview whenever selectedStudent or emailType changes in Single Mode
  useEffect(() => {
    const fetchPreview = async () => {
      if (sendMode === "single" && selectedStudent) {
        const studentId = selectedStudent.student_id || selectedStudent.id;
        try {
          setPreviewLoading(true);
          const p = await teacherApi.previewParentEmail({
            student_id: studentId,
            category: emailType,
          });
          if (p) {
            setPreviewData(p);
            setCustomSubject(p.subject || "");
            setMessageBody(p.body || "");
          }
        } catch (err) {
          console.error("Preview load error:", err);
        } finally {
          setPreviewLoading(false);
        }
      } else if (sendMode === "all") {
        setPreviewData(null);
        const totalStudents = students.length;
        if (emailType === "Attendance Report" || emailType === "Attendance Warning") {
          setCustomSubject(`[EduConnect Class Broadcast] Student Attendance Summary (${totalStudents} Students)`);
          setMessageBody(
            `Dear Parents & Guardians,\n\nThis is a class-wide automated email broadcast containing individual Attendance Database Reports for all ${totalStudents} enrolled students.\n\nEach parent receives their ward's specific attendance percentage and conducted lectures summary.\n\nWarm regards,\nDepartment Faculty Coordinator`
          );
        } else if (emailType === "Semester Marksheet") {
          setCustomSubject(`[EduConnect Class Broadcast] Semester Final Marksheets (${totalStudents} Students)`);
          setMessageBody(
            `Dear Parents & Guardians,\n\nThis is a class-wide automated email broadcast containing official Semester Marksheet & Grade Summaries fetched from the EduConnect Database for all ${totalStudents} students.\n\nWarm regards,\nDepartment Examination Committee`
          );
        } else {
          setCustomSubject(`[EduConnect Class Broadcast] Important Department Notification`);
          setMessageBody(
            `Dear Parents & Guardians,\n\nThis is an urgent general notice dispatched to all parents of enrolled students regarding upcoming academic events, laboratory exams, and campus guidelines.`
          );
        }
      }
    };
    fetchPreview();
  }, [sendMode, selectedStudent, emailType, students.length]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setSendResult(null);

    if (sendMode === "single" && previewData && !previewData.is_parent_email_valid) {
      setError("Cannot send email: Target student does not have a registered parent email address.");
      return;
    }

    try {
      setSending(true);
      const idempotencyKey = `pe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = {
        send_mode: sendMode,
        student_id: selectedStudent?.student_id || selectedStudent?.id,
        category: emailType,
        custom_subject: customSubject,
        custom_body: messageBody,
        idempotency_key: idempotencyKey,
      };

      const res = await teacherApi.sendParentEmail(payload);
      setSendResult(res);

      if (res && res.sent_count > 0 && res.failed_count === 0) {
        notifySuccess(
          sendMode === "all"
            ? `Successfully dispatched email to all ${res.sent_count} parents!`
            : `Email dispatched to parent (${previewData?.parent_email || selectedStudent?.parent_email || ""})!`
        );
      } else if (res && res.sent_count > 0 && res.failed_count > 0) {
        notifyError(`Partial Send: Dispatched ${res.sent_count} emails, but ${res.failed_count} failed.`);
      } else {
        notifyError("Email dispatch failed. See detailed status below.");
      }
    } catch (err) {
      console.error("Parent email send error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to dispatch email.";
      setError(errMsg);
      notifyError(errMsg);
    } fontFinally: {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#64748B]">Loading student roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#2563EB]" /> Parent Email Dispatch & Reports
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Send live database attendance summaries, marksheet reports, and academic notices to verified parent emails.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="inline-flex rounded-lg border border-[#E2E8F0] p-1 bg-[#F8FAFC]">
          <button
            onClick={() => setSendMode("single")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              sendMode === "single" ? "bg-[#2563EB] text-white shadow-xs" : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Single Student
          </button>
          <button
            onClick={() => setSendMode("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              sendMode === "all" ? "bg-[#14B8A6] text-white shadow-xs" : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Send to All Students
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Dispatch Result Summary */}
      {sendResult && (
        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
          sendResult.failed_count === 0 ? "bg-green-50 border-green-200 text-green-900" : "bg-amber-50 border-amber-200 text-amber-900"
        }`}>
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Dispatch Result Summary
            </span>
            <span>Sent: {sendResult.sent_count} | Failed: {sendResult.failed_count} | Total: {sendResult.total}</span>
          </div>

          {Array.isArray(sendResult.results) && (
            <div className="space-y-1.5 pt-2 border-t border-black/10 max-h-48 overflow-y-auto">
              {sendResult.results.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] p-2 bg-white/80 rounded border border-black/5">
                  <div>
                    <strong className="text-[#1E293B]">{r.student_name}</strong>
                    <span className="text-[10px] text-[#64748B] ml-2">({r.parent_email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === "SENT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {r.status}
                    </span>
                    {r.error_detail && (
                      <span className="text-[10px] text-red-600 truncate max-w-[200px]" title={r.error_detail}>
                        {r.error_detail}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Roster */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
          {sendMode === "single" ? (
            <>
              <h2 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                Class Student Roster ({students.length})
              </h2>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {students.map((stu) => {
                  const stuId = stu.student_id || stu.id;
                  const isSelected = selectedStudent && (selectedStudent.student_id === stuId || selectedStudent.id === stuId);
                  const hasParentEmail = stu.parent_email && stu.parent_email.includes("@");
                  return (
                    <div
                      key={stuId}
                      onClick={() => setSelectedStudent(stu)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? "bg-[#2563EB]/10 border-[#2563EB] shadow-xs"
                          : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#E2E8F0]/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/20 shrink-0">
                        {((stu.first_name || stu.firstName || "S")[0] + (stu.last_name || stu.lastName || "")[0]).toUpperCase()}
                      </div>
                      <div className="truncate flex-1">
                        <p className={`font-bold ${isSelected ? "text-[#2563EB]" : "text-[#1E293B]"}`}>
                          {stu.first_name || stu.firstName} {stu.last_name || stu.lastName}
                        </p>
                        <p className="text-[10px] text-[#64748B] font-mono">{stu.enrollment_no || stu.enrollmentNo}</p>
                        <p className={`text-[10px] truncate ${hasParentEmail ? "text-[#14B8A6] font-medium" : "text-amber-600 font-semibold"}`}>
                          Parent: {stu.parent_name || "N/A"} ({hasParentEmail ? stu.parent_email : "No email"})
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#14B8A6] font-bold text-sm">
                  <Users className="w-5 h-5" /> Batch Mode Broadcast
                </div>
                <p className="text-[#1E293B] font-medium leading-relaxed">
                  Broadcasting to <strong className="text-[#14B8A6]">{students.length} Enrolled Students</strong>.
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Each student's report is generated dynamically from the PostgreSQL database and delivered independently to their registered parent address.
                </p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                <span className="font-bold text-[#1E293B] block border-b border-[#E2E8F0] pb-1">Recipients Overview ({students.length})</span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {students.map((s) => {
                    const hasEmail = s.parent_email && s.parent_email.includes("@");
                    return (
                      <div key={s.student_id || s.id} className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#1E293B]">{s.first_name} {s.last_name}</span>
                        <span className={`font-mono text-[10px] ${hasEmail ? "text-[#14B8A6]" : "text-red-500"}`}>
                          {s.parent_email || "No parent email"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Preview & Composition */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-5">
          {/* Target Student Details & Email Status */}
          {sendMode === "single" && selectedStudent ? (
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Target Student</span>
                  <h3 className="text-sm font-extrabold text-[#1E293B]">
                    {selectedStudent.first_name} {selectedStudent.last_name}{" "}
                    <span className="text-xs font-mono font-normal text-[#2563EB]">({selectedStudent.enrollment_no})</span>
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  previewData?.is_parent_email_valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {previewData?.is_parent_email_valid ? "Parent Email Registered ✓" : "Missing Parent Email ⚠"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-medium">Parent Name</span>
                  <strong className="text-[#1E293B] font-bold text-xs truncate block">{selectedStudent.parent_name || "N/A"}</strong>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-medium">Parent Email</span>
                  <strong className={`font-mono font-bold text-xs truncate block ${
                    previewData?.is_parent_email_valid ? "text-[#14B8A6]" : "text-red-500"
                  }`}>
                    {selectedStudent.parent_email || "Not Registered"}
                  </strong>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-medium">Parent Phone</span>
                  <strong className="text-[#1E293B] font-mono font-bold text-xs truncate block">{selectedStudent.parent_mobile || "N/A"}</strong>
                </div>
              </div>
            </div>
          ) : null}

          {/* Email Form */}
          <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#64748B] mb-1 font-semibold">Notification Category</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#1E293B] focus:ring-2 focus:ring-[#2563EB] outline-none"
              >
                <option value="Attendance Report">Attendance Record Summary (Auto-fetched from DB)</option>
                <option value="Attendance Warning">Attendance Warning (&lt; 75%)</option>
                <option value="Semester Marksheet">Semester Marksheet & Grade Sheet (Auto-fetched from DB)</option>
                <option value="Weekly Exam Result">Weekly Exam Result Summary</option>
                <option value="General Academic Notice">General Academic Notice</option>
                <option value="Discipline & Conduct Notice">Discipline & Conduct Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-[#64748B] mb-1 font-semibold">Email Subject Line</label>
              <input
                type="text"
                required
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:ring-2 focus:ring-[#2563EB] outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[#64748B] font-semibold">
                  Email Content / Message Body (Fetched from Database Records)
                </label>
                {previewLoading && <span className="text-[10px] text-[#2563EB] animate-pulse">Generating DB preview...</span>}
              </div>
              <textarea
                rows={8}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[#2563EB] outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B]">
                {sendMode === "all" ? `Recipients: ${students.length} Students` : `Target: ${selectedStudent?.parent_email || "Selected Student"}`}
              </span>
              <Button
                variant="accent"
                size="sm"
                type="submit"
                disabled={sending || (sendMode === "single" && previewData && !previewData.is_parent_email_valid)}
                icon={sending ? RefreshCw : (sendMode === "all" ? Users : Send)}
                className={`text-xs ${sending ? "animate-pulse opacity-70" : ""}`}
              >
                {sending
                  ? "Dispatching Emails..."
                  : sendMode === "all"
                  ? `Send Email to ALL ${students.length} Students`
                  : "Send Email Notification"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherParentEmail;
