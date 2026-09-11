import React, { useState, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Filter, AlertCircle } from "lucide-react";
import { studentApi } from "../../services/api";

const StudentAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await studentApi.getAttendance();
        if (Array.isArray(data)) {
          setAttendanceRecords(data);
        } else {
          setAttendanceRecords([]);
        }
      } catch (err) {
        console.error("Attendance load error:", err);
        setError("Failed to load attendance records. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Extract unique subject names for filter
  const subjectList = Array.from(
    new Set(
      attendanceRecords
        .map((r) => r.subject_name || r.subject?.subject_name)
        .filter(Boolean)
    )
  );

  // Filter records by subject if selected
  const filteredRecords = selectedSubject === "ALL"
    ? attendanceRecords
    : attendanceRecords.filter(
        (r) => (r.subject_name || r.subject?.subject_name) === selectedSubject
      );

  const presentCount = filteredRecords.filter((r) => {
    const st = r.attendance_status || r.status;
    return st === "Present" || st === "Late";
  }).length;

  const totalCount = filteredRecords.length;
  const attendancePct = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Header & Overview Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Attendance Records</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Track your session-by-session class attendance statistics</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="px-4 py-2 bg-[#22C55E]/10 rounded-xl border border-[#22C55E]/20 text-center flex-1 sm:flex-initial">
            <span className="block text-[10px] uppercase font-bold text-[#22C55E]">Overall Percentage</span>
            <span className="text-lg font-extrabold text-[#22C55E]">{attendancePct}%</span>
          </div>
          <div className="px-4 py-2 bg-[#2563EB]/10 rounded-xl border border-[#2563EB]/20 text-center flex-1 sm:flex-initial">
            <span className="block text-[10px] uppercase font-bold text-[#2563EB]">Sessions Attended</span>
            <span className="text-lg font-extrabold text-[#2563EB]">{presentCount} / {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {subjectList.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
            <Filter className="w-4 h-4 text-[#2563EB]" />
            Filter by Subject:
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-[#1E293B]"
          >
            <option value="ALL">All Subjects ({attendanceRecords.length})</option>
            {subjectList.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-xs text-[#EF4444] font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Attendance Table matching DB structure */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#2563EB]" />
            Session Attendance History
          </h2>
          <span className="text-xs text-[#64748B]">Total: {filteredRecords.length} sessions</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#64748B]">
            <div className="inline-block w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Loading attendance history...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B]">
            <CalendarCheck className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#1E293B] text-sm">No attendance records found</p>
            <p className="text-xs text-[#64748B] mt-1">Attendance marked by your teachers will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Session Date</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Lecture No</th>
                  <th className="p-3.5">Timing</th>
                  <th className="p-3.5">Topic Covered</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {filteredRecords.map((item, idx) => {
                  const status = item.attendance_status || item.status || "Absent";
                  const sessionDate = item.session_date || item.session?.session_date || item.date || "-";
                  const subjectName = item.subject_name || item.subject?.subject_name || "Subject";
                  const lectureNo = item.lecture_no || item.session?.lecture_no || idx + 1;
                  const startTime = item.start_time || item.session?.start_time || "";
                  const endTime = item.end_time || item.session?.end_time || "";
                  const timing = startTime && endTime ? `${startTime} - ${endTime}` : startTime || "-";
                  const topic = item.topic || item.session?.topic || "Regular Lecture";

                  return (
                    <tr key={item.attendance_id || item.id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 font-mono font-medium text-[#1E293B]">{sessionDate}</td>
                      <td className="p-3.5 font-bold text-[#2563EB]">{subjectName}</td>
                      <td className="p-3.5 font-medium">Lecture #{lectureNo}</td>
                      <td className="p-3.5 font-mono text-[#64748B]">{timing}</td>
                      <td className="p-3.5 text-[#1E293B]">{topic}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            status === "Present"
                              ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                              : status === "Late"
                              ? "bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/20"
                              : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                          }`}
                        >
                          {status === "Present" ? (
                            <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                          ) : status === "Late" ? (
                            <Clock className="w-3 h-3 text-[#D97706]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-[#EF4444]" />
                          )}
                          {status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#64748B]">{item.remarks || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
