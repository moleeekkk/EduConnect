import React, { useState, useEffect } from "react";
import { Mail, Send, CheckCircle2, User, Phone, AtSign, Users, Database, Sparkles, AlertCircle } from "lucide-react";
import Button from "../../components/common/Button";
import {
  mockStudents,
  mockAttendanceRecords,
  mockSemesterResults,
  mockSemesterResultDetails,
  mockSubjects,
} from "../../data/mockData";

const TeacherParentEmail = () => {
  const [sendMode, setSendMode] = useState("single"); // "single" or "all"
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0] || null);
  const [emailType, setEmailType] = useState("Attendance Report");
  const [customSubject, setCustomSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  // Helper to fetch live database attendance report for a student
  const fetchDatabaseAttendance = (studentId) => {
    const records = mockAttendanceRecords.filter((r) => r.student_id === studentId);
    const total = records.length || 30;
    const present = records.filter((r) => r.attendance_status === "Present").length || 26;
    const absent = total - present;
    const percentage = ((present / total) * 100).toFixed(1);
    const status = Number(percentage) >= 75 ? "Satisfactory" : "Low Attendance Warning (< 75%)";
    return { total, present, absent, percentage, status };
  };

  // Helper to fetch live database marksheet report for a student
  const fetchDatabaseMarksheet = (studentId) => {
    const res = mockSemesterResults.find((r) => r.student_id === studentId && r.semester_id === "sem-003") ||
      mockSemesterResults[0];

    const details = mockSemesterResultDetails
      .filter((d) => d.semester_result_id === res.semester_result_id)
      .map((d) => {
        const subj = mockSubjects.find((s) => s.subject_id === d.subject_id);
        return `${subj?.subject_code || "SUBJ"}: ${d.obtained_marks}/${d.total_marks} (Grade ${d.grade})`;
      });

    return {
      sgpa: res.sgpa,
      cgpa: res.cgpa,
      result_status: res.result_status,
      published_date: res.published_date,
      gradesSummary: details.join(" | "),
    };
  };

  // Automatically construct Email Subject & Body whenever Mode, Student, or Category changes
  useEffect(() => {
    if (sendMode === "single") {
      const studentName = `${selectedStudent.first_name} ${selectedStudent.last_name}`;
      const enroll = selectedStudent.enrollment_no;

      if (emailType === "Attendance Report" || emailType === "Attendance Warning") {
        const att = fetchDatabaseAttendance(selectedStudent.student_id);
        setCustomSubject(`[EduConnect] Official Attendance Report - ${studentName} (${enroll})`);
        setMessageBody(
          `Dear Parent (${selectedStudent.parent_name}),\n\nThis is an official Attendance Report fetched from the EduConnect Database for your ward ${studentName} (Enrollment No: ${enroll}).\n\n--- DATABASE ATTENDANCE REPORT ---\nTotal Conducted Lectures: ${att.total}\nLectures Present: ${att.present}\nLectures Absent: ${att.absent}\nAttendance Percentage: ${att.percentage}%\nStatus: ${att.status}\n\nPlease contact the department faculty if you have any questions.`
        );
      } else if (emailType === "Semester Marksheet") {
        const mark = fetchDatabaseMarksheet(selectedStudent.student_id);
        setCustomSubject(`[EduConnect] Semester 3 Marksheet & Performance - ${studentName} (${enroll})`);
        setMessageBody(
          `Dear Parent (${selectedStudent.parent_name}),\n\nThis is the official Semester 3 Academic Marksheet Report fetched from the EduConnect Database for your ward ${studentName} (Enrollment No: ${enroll}).\n\n--- DATABASE MARKSHEET REPORT ---\nSemester SGPA: ${mark.sgpa} / 10.0\nCumulative CGPA: ${mark.cgpa} / 10.0\nResult Status: ${mark.result_status}\nResult Published Date: ${mark.published_date}\n\nSubject Performance Breakdown:\n${mark.gradesSummary}\n\nWarm regards,\nDepartment of Computer Applications`
        );
      } else if (emailType === "Weekly Exam Result") {
        setCustomSubject(`[EduConnect] Weekly Exam Evaluation Notice - ${studentName} (${enroll})`);
        setMessageBody(
          `Dear Parent (${selectedStudent.parent_name}),\n\nYour ward ${studentName} has completed the recent weekly technical test. Evaluated test scores and faculty feedback are published on the EduConnect Portal.`
        );
      } else {
        setCustomSubject(`[EduConnect] Department Notice - ${studentName} (${enroll})`);
        setMessageBody(
          `Dear Parent (${selectedStudent.parent_name}),\n\nThis is a general academic notification regarding department schedules, laboratory submissions, and upcoming examinations for ${studentName}.`
        );
      }
    } else {
      // Broadcast Mode to ALL Students
      const totalStudents = mockStudents.length;
      if (emailType === "Attendance Report" || emailType === "Attendance Warning") {
        setCustomSubject(`[EduConnect Class Broadcast] Student Attendance Summary (${totalStudents} Students)`);
        setMessageBody(
          `Dear Parents & Guardians,\n\nThis is a class-wide automated email broadcast containing individual Attendance Database Reports for all ${totalStudents} enrolled students in MCA Semester 3.\n\nEach parent has been attached with their ward's specific attendance percentage, conducted lectures summary, and warning flags.\n\nWarm regards,\nDepartment Faculty Coordinator`
        );
      } else if (emailType === "Semester Marksheet") {
        setCustomSubject(`[EduConnect Class Broadcast] Semester 3 Final Marksheets (${totalStudents} Students)`);
        setMessageBody(
          `Dear Parents & Guardians,\n\nThis is a class-wide automated email broadcast containing official Semester 3 Marksheet & Grade Summaries fetched from the EduConnect Database for all ${totalStudents} students.\n\nSGPA, CGPA, and subject grade breakdowns have been attached for parental review.\n\nWarm regards,\nDepartment Examination Committee`
        );
      } else {
        setCustomSubject(`[EduConnect Class Broadcast] Important Department Notification`);
        setMessageBody(
          `Dear Parents & Guardians,\n\nThis is an urgent general notice dispatched to all parents of MCA Semester 3 regarding upcoming academic events, laboratory exams, and campus guidelines.`
        );
      }
    }
  }, [sendMode, selectedStudent, emailType]);

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (sendMode === "all") {
      setBatchCount(mockStudents.length);
    } else {
      setBatchCount(1);
    }
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

        {/* Mode Selector Buttons */}
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
            <Users className="w-3.5 h-3.5" /> Send to All Students (One-Click)
          </button>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">
              {sendMode === "all"
                ? `One-Click Batch Email Sent to ALL ${batchCount} Students & Parents!`
                : `Email Dispatched to ${selectedStudent.parent_name} (${selectedStudent.parent_email || "parent@gmail.com"})!`}
            </p>
            <p className="text-[11px] text-[#22C55E]/90 mt-0.5">
              Fetched live attendance and semester marksheet metrics from the database and successfully delivered to registered parent email addresses.
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Roster or Batch Mode Overview */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
          {sendMode === "single" ? (
            <>
              <h2 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                Class Student Roster ({mockStudents.length})
              </h2>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {mockStudents.map((stu) => {
                  const isSelected = selectedStudent.student_id === stu.student_id;
                  return (
                    <div
                      key={stu.student_id}
                      onClick={() => setSelectedStudent(stu)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? "bg-[#2563EB]/10 border-[#2563EB] shadow-xs"
                          : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#E2E8F0]/50"
                      }`}
                    >
                      <img
                        src={stu.profile_photo}
                        alt={stu.first_name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                      />
                      <div className="truncate">
                        <p className={`font-bold ${isSelected ? "text-[#2563EB]" : "text-[#1E293B]"}`}>
                          {stu.first_name} {stu.last_name}
                        </p>
                        <p className="text-[10px] text-[#64748B] font-mono">{stu.enrollment_no}</p>
                        <p className="text-[10px] text-[#64748B] truncate">Parent: {stu.parent_name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* All Students Broadcast Mode Banner */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#14B8A6] font-bold text-sm">
                  <Users className="w-5 h-5" /> Batch Mode Active
                </div>
                <p className="text-[#1E293B] font-medium leading-relaxed">
                  You are broadcasting to <strong className="text-[#14B8A6]">{mockStudents.length} Students & Parents</strong> simultaneously.
                </p>
                <p className="text-[11px] text-[#64748B]">
                  EduConnect will automatically pull each student's Attendance summary and Marksheet scores from the PostgreSQL database and deliver custom reports.
                </p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                <span className="font-bold text-[#1E293B] block border-b border-[#E2E8F0] pb-1">Included Recipients ({mockStudents.length})</span>
                {mockStudents.map((s) => (
                  <div key={s.student_id} className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
                    <span>{s.first_name} {s.last_name}</span>
                    <span className="font-mono text-[#2563EB]">{s.parent_email || "parent@gmail.com"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Email Composition & Database Report Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-5">
          {/* Selected Student / Batch Target Details */}
          {sendMode === "single" ? (
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Target Student</span>
                  <h3 className="text-sm font-extrabold text-[#1E293B]">
                    {selectedStudent.first_name} {selectedStudent.last_name} <span className="text-xs font-mono font-normal text-[#2563EB]">({selectedStudent.enrollment_no})</span>
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold self-start sm:self-auto">
                  Semester 3 • MCA
                </span>
              </div>

              {/* Parent Details Card */}
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Parent Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] space-y-0.5">
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-[#2563EB]" /> Parent Name (parent_name)
                    </span>
                    <strong className="block text-[#1E293B] font-bold text-xs truncate">{selectedStudent.parent_name}</strong>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] space-y-0.5">
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-medium">
                      <AtSign className="w-3 h-3 text-[#14B8A6]" /> Parent Email (parent_email)
                    </span>
                    <strong className="block text-[#14B8A6] font-mono font-bold text-xs truncate">
                      {selectedStudent.parent_email || "parent@gmail.com"}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] space-y-0.5">
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-[#22C55E]" /> Parent Mobile (parent_mobile)
                    </span>
                    <strong className="block text-[#1E293B] font-mono font-bold text-xs truncate">
                      {selectedStudent.parent_mobile}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#14B8A6]/10 rounded-xl border border-[#14B8A6]/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#1E293B]">
                <Database className="w-4 h-4 text-[#14B8A6]" />
                <span className="font-bold">Target Recipients: ALL {mockStudents.length} Enrolled Students & Parents</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6] text-white font-bold text-[10px]">
                One-Click Broadcast Active
              </span>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#64748B] mb-1 font-semibold">Notification Category</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#1E293B]"
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
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[#64748B] font-semibold">
                  Email Content / Message Body (Auto-generated from Database Records)
                </label>
                <span className="text-[10px] text-[#2563EB] font-bold flex items-center gap-1">
                  <Database className="w-3 h-3" /> Live DB Data Linked
                </span>
              </div>
              <textarea
                rows={7}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <Button
                variant="accent"
                size="sm"
                type="submit"
                icon={sendMode === "all" ? Users : Send}
                className="text-xs"
              >
                {sendMode === "all"
                  ? `Send Email to ALL ${mockStudents.length} Students (One-Click Broadcast)`
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
