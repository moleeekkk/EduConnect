import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
} from "lucide-react";
import { studentApi } from "../../services/api";

const StudentAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL"); // ALL, HIGH, LOW
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Retrieve logged-in student enrollment number / identifier
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("educonnect_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const studentIdentifier =
    currentUser?.student_id ||
    currentUser?.studentId ||
    currentUser?.enrollment_no ||
    currentUser?.enrollmentNo ||
    currentUser?.identifier ||
    currentUser?.userId ||
    "2024MCA001";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsData, subjectsData] = await Promise.all([
          studentApi.getAttendance(studentIdentifier),
          studentApi.getSubjects(studentIdentifier),
        ]);

        if (Array.isArray(recordsData)) {
          setAttendanceRecords(recordsData);
        }
        if (Array.isArray(subjectsData)) {
          setStudentSubjects(subjectsData);
        }
      } catch (err) {
        console.error("Error loading student attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentIdentifier]);

  // Subjects list for current student including enrolled subjects and recorded attendance subjects
  const subjectsList = useMemo(() => {
    const map = new Map();

    studentSubjects.forEach((sub) => {
      const id = String(sub.subject_id || sub.id || sub.subject_code || sub.code);
      const name = sub.subject_name || sub.name || "Subject";
      const code = sub.subject_code || sub.code || "";
      if (id && !map.has(id)) {
        map.set(id, { id, name, code });
      }
    });

    attendanceRecords.forEach((r) => {
      const name = r.subject_name || r.subject?.subject_name || r.subject || "";
      const code = r.subject_code || r.subject?.subject_code || "";
      const id = String(r.subject_id || r.subject?.subject_id || code || name || "");

      if (id || name) {
        let exists = false;
        for (const [k, v] of map.entries()) {
          if (
            (id && v.id.toLowerCase() === id.toLowerCase()) ||
            (code && v.code.toLowerCase() === code.toLowerCase()) ||
            (name && v.name.toLowerCase() === name.toLowerCase())
          ) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          const key = id || code || name;
          map.set(key, { id: key, name: name || "Subject", code: code || "" });
        }
      }
    });

    return Array.from(map.values());
  }, [studentSubjects, attendanceRecords]);

  // Compute detailed per-subject attendance stats & session records
  const subjectCardData = useMemo(() => {
    return subjectsList.map((sub) => {
      const recordsForSub = attendanceRecords.filter((r) => {
        const rName = (r.subject_name || r.subject?.subject_name || r.subject || "").trim().toLowerCase();
        const rCode = (r.subject_code || r.subject?.subject_code || "").trim().toLowerCase();
        const rId = String(r.subject_id || r.subject?.subject_id || "").trim().toLowerCase();

        const sId = String(sub.id || sub.subject_id || "").trim().toLowerCase();
        const sCode = String(sub.code || sub.subject_code || "").trim().toLowerCase();
        const sName = String(sub.name || sub.subject_name || "").trim().toLowerCase();

        const idMatch = rId && sId && (rId === sId || rId.includes(sId) || sId.includes(rId));
        const codeMatch = rCode && sCode && (rCode === sCode || sCode.includes(rCode) || rCode.includes(sCode));
        const nameMatch = rName && sName && (rName === sName || sName.includes(rName) || rName.includes(sName));

        const fallbackMatch = (!rId && !rCode && !rName) || subjectsList.length === 1;

        return idMatch || codeMatch || nameMatch || fallbackMatch;
      });

      const total = recordsForSub.length;
      const present = recordsForSub.filter((r) => {
        const st = String(r.attendance_status || r.status || "").trim().toLowerCase();
        return st === "present";
      }).length;
      const absent = total - present;
      const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
      const floatPct = parseFloat(pct);

      return {
        ...sub,
        total,
        present,
        absent,
        pct: floatPct,
        isLow: total > 0 && floatPct < 75.0,
        sessions: recordsForSub,
      };
    });
  }, [subjectsList, attendanceRecords]);

  // Filter subject cards based on search query & attendance filter
  const filteredCards = useMemo(() => {
    return subjectCardData.filter((card) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        card.name.toLowerCase().includes(q) ||
        card.code.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (attendanceFilter === "HIGH") return card.pct >= 75.0;
      if (attendanceFilter === "LOW") return card.pct < 75.0;
      return true;
    });
  }, [subjectCardData, searchQuery, attendanceFilter]);

  // Global aggregate stats
  const totalAttendedGlobal = subjectCardData.reduce((acc, c) => acc + c.present, 0);
  const totalSessionsGlobal = subjectCardData.reduce((acc, c) => acc + c.total, 0);
  const globalPct =
    totalSessionsGlobal > 0
      ? ((totalAttendedGlobal / totalSessionsGlobal) * 100).toFixed(1)
      : "0.0";

  const toggleExpand = (subId) => {
    setExpandedSubjectId((prev) => (prev === subId ? null : subId));
  };

  return (
    <div className="space-y-4">
      {/* Header Banner - Compact Smaller Font */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-[#2563EB] tracking-wider border border-blue-100">
              Student Portal
            </span>
          </div>
          <h1 className="text-lg font-bold text-[#1E293B] tracking-tight">Subject Attendance</h1>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Monitor your subject-wise lecture attendance cards and session records.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/20 text-center min-w-[95px]">
            <span className="block text-[9px] uppercase font-bold text-[#22C55E] tracking-wider">
              Overall Rate
            </span>
            <span className="text-base font-extrabold text-[#22C55E]">{globalPct}%</span>
          </div>
          <div className="px-3 py-1.5 bg-[#2563EB]/10 rounded-lg border border-[#2563EB]/20 text-center min-w-[95px]">
            <span className="block text-[9px] uppercase font-bold text-[#2563EB] tracking-wider">
              Attended
            </span>
            <span className="text-base font-extrabold text-[#2563EB]">
              {totalAttendedGlobal} / {totalSessionsGlobal}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar - Compact Smaller Font */}
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-semibold text-[#1E293B] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center bg-[#F8FAFC] p-0.5 rounded-lg border border-[#E2E8F0] text-[11px] font-bold">
          <button
            onClick={() => setAttendanceFilter("ALL")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              attendanceFilter === "ALL"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            All ({subjectCardData.length})
          </button>
          <button
            onClick={() => setAttendanceFilter("HIGH")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              attendanceFilter === "HIGH"
                ? "bg-[#22C55E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Good (≥75%)
          </button>
          <button
            onClick={() => setAttendanceFilter("LOW")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              attendanceFilter === "LOW"
                ? "bg-[#EF4444] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Low (&lt;75%)
          </button>
        </div>
      </div>

      {/* Subject Attendance Cards Grid - Smaller Compact Fonts */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] text-center text-[11px] text-[#64748B]">
          Loading subject attendance cards...
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] text-center text-[11px] text-[#64748B]">
          No subject attendance cards match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCards.map((subject) => {
            const isExpanded = expandedSubjectId === subject.id;

            return (
              <div
                key={subject.id}
                className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Card Body */}
                <div className="p-3.5">
                  {/* Header: Subject Code & Status Badge */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
                      {subject.code || "SUB"}
                    </span>

                    {/* Status Badge - Compact */}
                    {subject.total === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-[#64748B] border border-slate-200">
                        <Clock className="w-3 h-3" />
                        No Sessions
                      </span>
                    ) : subject.isLow ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                        <AlertTriangle className="w-3 h-3" />
                        Low (&lt;75%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Good
                      </span>
                    )}
                  </div>

                  {/* Subject Name - Smaller text-xs */}
                  <h2 className="text-xs font-bold text-[#1E293B] mb-2.5 line-clamp-2 min-h-[32px]" title={subject.name}>
                    {subject.name}
                  </h2>

                  {/* Attendance Rate Box */}
                  <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Rate
                      </span>
                      <span
                        className={`text-lg font-black ${
                          subject.isLow ? "text-[#EF4444]" : "text-[#22C55E]"
                        }`}
                      >
                        {subject.pct}%
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          subject.isLow ? "bg-[#EF4444]" : "bg-[#22C55E]"
                        }`}
                        style={{ width: `${Math.min(subject.pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Grid - Compact */}
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-[#E2E8F0]">
                      <span className="block text-[9px] uppercase font-bold text-[#64748B]">
                        Total
                      </span>
                      <span className="text-xs font-bold text-[#1E293B]">
                        {subject.total}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-[#22C55E]/5 border border-[#22C55E]/20">
                      <span className="block text-[9px] uppercase font-bold text-[#22C55E]">
                        Attended
                      </span>
                      <span className="text-xs font-bold text-[#22C55E]">
                        {subject.present}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/20">
                      <span className="block text-[9px] uppercase font-bold text-[#EF4444]">
                        Missed
                      </span>
                      <span className="text-xs font-bold text-[#EF4444]">
                        {subject.absent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Session Records History */}
                <div className="border-t border-[#E2E8F0] bg-[#F8FAFC]">
                  <button
                    onClick={() => toggleExpand(subject.id)}
                    className="w-full px-3.5 py-2 flex items-center justify-between text-[11px] font-bold text-[#2563EB] hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      {isExpanded ? "Hide Logs" : `View Logs (${subject.total})`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Expandable Session Logs */}
                  {isExpanded && (
                    <div className="p-3 pt-0 space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar">
                      {subject.sessions.length === 0 ? (
                        <p className="text-center text-[10px] text-[#64748B] py-2">
                          No lecture logs recorded yet.
                        </p>
                      ) : (
                        subject.sessions.map((sess, idx) => {
                          const status = sess.attendance_status || sess.status || "Present";
                          const isPresent = status === "Present";
                          const date = sess.session_date || sess.date || "-";
                          const lectureNo = sess.lecture_no || idx + 1;
                          const topic = sess.topic || "Regular Lecture";

                          return (
                            <div
                              key={sess.attendance_id || idx}
                              className="p-2 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between text-[10px] hover:border-[#2563EB]/30 transition-colors"
                            >
                              <div className="space-y-0.5 max-w-[68%]">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[#1E293B]">
                                    {date}
                                  </span>
                                  <span className="text-[9px] text-[#64748B] font-semibold bg-slate-100 px-1 py-0.2 rounded">
                                    Lec #{lectureNo}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#64748B] truncate" title={topic}>
                                  {topic}
                                </p>
                              </div>

                              <span
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                  isPresent
                                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                                    : "bg-[#EF4444]/10 text-[#EF4444]"
                                }`}
                              >
                                {isPresent ? (
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                ) : (
                                  <XCircle className="w-2.5 h-2.5" />
                                )}
                                {status}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
