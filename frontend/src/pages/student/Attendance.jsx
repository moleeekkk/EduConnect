import React from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import { mockAttendanceSessions, mockAttendanceRecords, mockSubjects } from "../../data/mockData";

const StudentAttendance = () => {
  const studentId = "stu-001";
  
  // Map records with session details
  const attendanceHistory = mockAttendanceRecords
    .filter((rec) => rec.student_id === studentId)
    .map((rec) => {
      const session = mockAttendanceSessions.find((s) => s.session_id === rec.session_id);
      const subject = mockSubjects[0]; // Advanced Web Tech
      return {
        ...rec,
        session,
        subject,
      };
    });

  const presentCount = attendanceHistory.filter((r) => r.attendance_status === "Present").length;
  const totalCount = attendanceHistory.length || 1;
  const attendancePct = ((presentCount / totalCount) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Attendance</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#22C55E]/10 rounded-xl border border-[#22C55E]/20 text-center">
            <span className="block text-[10px] uppercase font-bold text-[#22C55E]">Overall Percentage</span>
            <span className="text-lg font-extrabold text-[#22C55E]">{attendancePct}%</span>
          </div>
          <div className="px-4 py-2 bg-[#2563EB]/10 rounded-xl border border-[#2563EB]/20 text-center">
            <span className="block text-[10px] uppercase font-bold text-[#2563EB]">Sessions Attended</span>
            <span className="text-lg font-extrabold text-[#2563EB]">{presentCount} / {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Attendance Table matching DB structure */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Session Records History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Session Date (session_date)</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Lecture No</th>
                <th className="p-3.5">Timing (start_time - end_time)</th>
                <th className="p-3.5">Topic Covered (topic)</th>
                <th className="p-3.5">Status (attendance_status)</th>
                <th className="p-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {attendanceHistory.map((item) => (
                <tr key={item.attendance_id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-3.5 font-mono">{item.session?.session_date}</td>
                  <td className="p-3.5 font-bold text-[#2563EB]">{item.subject?.subject_name}</td>
                  <td className="p-3.5">Lecture #{item.session?.lecture_no}</td>
                  <td className="p-3.5 font-mono">{item.session?.start_time} - {item.session?.end_time}</td>
                  <td className="p-3.5">{item.session?.topic}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.attendance_status === "Present"
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-[#EF4444]/10 text-[#EF4444]"
                      }`}
                    >
                      {item.attendance_status === "Present" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {item.attendance_status}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#64748B]">{item.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
