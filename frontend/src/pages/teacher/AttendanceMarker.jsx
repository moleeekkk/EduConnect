import React, { useState, useEffect } from "react";
import { CalendarCheck, Save, CheckCircle2, UserCheck, UserX, Clock, History, Edit3, RefreshCw } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherAttendanceMarker = () => {
  const [activeTab, setActiveTab] = useState("mark"); // "mark" | "history"

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState("");

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [lectureNo, setLectureNo] = useState(1);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("11:00");
  const [topic, setTopic] = useState("Lecture Session & Practical Demonstration");

  const [students, setStudents] = useState([]);
  const [studentStatus, setStudentStatus] = useState({});
  const [studentRemarks, setStudentRemarks] = useState({});
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(false);

  // Past Sessions state
  const [pastSessions, setPastSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch assigned subjects on load
  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      try {
        const data = await teacherApi.getAssignedSubjects();
        if (Array.isArray(data) && data.length > 0) {
          setAssignedSubjects(data);
          const firstId = data[0].allocation_id || data[0].teacher_subject_id;
          if (firstId) setSelectedAllocationId(firstId);
        }
      } catch (err) {
        console.error("Failed to load teacher assigned subjects:", err);
      }
    };
    fetchAssignedSubjects();
  }, []);

  // Fetch student roster whenever selected allocation changes
  useEffect(() => {
    if (!selectedAllocationId) return;

    const fetchStudentsForAllocation = async () => {
      try {
        const stuData = await teacherApi.getStudents();
        if (Array.isArray(stuData)) {
          setStudents(stuData);
          if (!editingSessionId) {
            const initialStatus = {};
            const initialRemarks = {};
            stuData.forEach((s) => {
              const sid = s.student_id || s.id;
              initialStatus[sid] = "Present";
              initialRemarks[sid] = "";
            });
            setStudentStatus(initialStatus);
            setStudentRemarks(initialRemarks);
          }
        }
      } catch (err) {
        console.error("Error loading cohort students:", err);
      }
    };
    fetchStudentsForAllocation();
  }, [selectedAllocationId]);

  // Load Past Sessions
  const loadPastSessions = async () => {
    setLoadingHistory(true);
    try {
      const sessions = await teacherApi.getAttendanceSessions();
      if (Array.isArray(sessions)) {
        setPastSessions(sessions);
      }
    } catch (err) {
      console.error("Failed to load past attendance sessions:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadPastSessions();
    }
  }, [activeTab]);

  const toggleStatus = (id) => {
    setStudentStatus((prev) => {
      const current = prev[id] || "Present";
      let next = "Absent";
      if (current === "Present") next = "Absent";
      else if (current === "Absent") next = "Late";
      else next = "Present";
      return { ...prev, [id]: next };
    });
  };

  const handleSaveAttendance = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedAllocationId) {
      notifyError("Please select a subject allocation.");
      return;
    }
    if (!sessionDate) {
      notifyError("Please select a valid lecture session date.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        teacher_subject_id: selectedAllocationId,
        session_date: sessionDate,
        lecture_no: Number(lectureNo) || 1,
        start_time: startTime,
        end_time: endTime,
        topic_covered: topic,
        student_statuses: students.map((s) => {
          const sid = s.student_id || s.id;
          return {
            student_id: sid,
            status: studentStatus[sid] || "Present",
            remarks: studentRemarks[sid] || "",
          };
        }),
      };

      if (editingSessionId) {
        await teacherApi.updateAttendanceSession(editingSessionId, payload);
        notifySuccess("Attendance session & student records updated successfully!");
      } else {
        await teacherApi.markAttendance(payload);
        notifySuccess(`Attendance for ${students.length || 0} students recorded & saved to database!`);
      }

      setSaveMsg(true);
      setEditingSessionId(null);
      setTimeout(() => setSaveMsg(false), 3000);
    } catch (err) {
      console.error("Save attendance error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save attendance.";
      notifyError(`Attendance Save Failed: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reload session for editing
  const handleEditSession = async (sessionId) => {
    try {
      const detail = await teacherApi.getAttendanceSessionDetail(sessionId);
      if (detail) {
        const allocId = detail.allocation_id || detail.teacher_subject_id;
        if (allocId) setSelectedAllocationId(allocId);

        setSessionDate(detail.session_date || new Date().toISOString().split("T")[0]);
        setLectureNo(detail.lecture_no || 1);
        setStartTime(detail.start_time || "09:30");
        setEndTime(detail.end_time || "11:00");
        setTopic(detail.topic || "Lecture Session");

        const records = detail.records || detail.student_statuses || [];
        const statusMap = {};
        const remarkMap = {};
        records.forEach((r) => {
          const sid = r.student_id;
          statusMap[sid] = r.status || "Present";
          remarkMap[sid] = r.remarks || "";
        });
        setStudentStatus(statusMap);
        setStudentRemarks(remarkMap);
        setEditingSessionId(sessionId);
        setActiveTab("mark");
        notifySuccess("Session loaded into editor! Click 'Save Attendance Record' after making corrections.");
      }
    } catch (err) {
      console.error("Failed to load session detail:", err);
      notifyError("Failed to load session details for editing.");
    }
  };

  const handleResetForm = () => {
    setEditingSessionId(null);
    setSessionDate(new Date().toISOString().split("T")[0]);
    setLectureNo(1);
    setStartTime("09:30");
    setEndTime("11:00");
    setTopic("Lecture Session & Practical Demonstration");
    const initialStatus = {};
    students.forEach((s) => {
      initialStatus[s.student_id || s.id] = "Present";
    });
    setStudentStatus(initialStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#14B8A6]/10 rounded-xl text-[#14B8A6]">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">
              {editingSessionId ? "Edit Lecture Session" : "Attendance Marker"}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {editingSessionId ? `Modifying Session ID: ${editingSessionId}` : "Record & manage student lecture attendance"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#F1F5F9] p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("mark")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "mark" ? "bg-white text-[#1E293B] shadow-xs" : "text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" />
              {editingSessionId ? "Edit Session" : "Mark Session"}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "history" ? "bg-white text-[#1E293B] shadow-xs" : "text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              <History className="w-3.5 h-3.5 inline mr-1" /> Session History
            </button>
          </div>

          {activeTab === "mark" && (
            <Button variant="accent" size="sm" icon={Save} isLoading={isSaving} onClick={handleSaveAttendance} className="text-xs">
              {editingSessionId ? "Update Session" : "Save Record"}
            </Button>
          )}
        </div>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Lecture session and attendance saved successfully to database!
        </div>
      )}

      {activeTab === "mark" && (
        <>
          {/* Session Parameters Form */}
          <form onSubmit={handleSaveAttendance} className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h2 className="text-sm font-bold text-[#1E293B]">Session Configuration Parameters</h2>
              {editingSessionId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-[#14B8A6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> New Session
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Assigned Subject & Cohort</label>
                <select
                  value={selectedAllocationId}
                  onChange={(e) => setSelectedAllocationId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                >
                  {assignedSubjects.map((alloc) => {
                    const allocId = alloc.allocation_id || alloc.teacher_subject_id;
                    const subName = alloc.subject_name || alloc.subjectName || "Subject";
                    const batchName = alloc.batch_name || alloc.batchName || "";
                    return (
                      <option key={allocId} value={allocId}>
                        {subName} {batchName ? `(${batchName})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Lecture Date (session_date)</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Lecture No (lecture_no)</label>
                <input
                  type="number"
                  min={1}
                  value={lectureNo}
                  onChange={(e) => setLectureNo(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Start Time (start_time)</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">End Time (end_time)</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#64748B] mb-1 font-medium">Lecture Topic Covered (topic)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Unit 3: React Hooks & State Management"
                className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
              />
            </div>
          </form>

          {/* Student Roster List */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Class Student Roster ({students.length})</h2>
                <p className="text-[11px] text-[#64748B]">Click student card to toggle: Present → Absent → Late</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-[#22C55E]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Present: {Object.values(studentStatus).filter(s => s === "Present").length}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-[#EF4444]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Absent: {Object.values(studentStatus).filter(s => s === "Absent").length}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-[#F59E0B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Late: {Object.values(studentStatus).filter(s => s === "Late").length}
                </span>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.map((stu) => {
                const stuId = stu.student_id || stu.id;
                const status = studentStatus[stuId] || "Present";
                const isPresent = status === "Present";
                const isAbsent = status === "Absent";

                let cardBorder = "bg-[#22C55E]/5 border-[#22C55E]/30";
                let badgeStyle = "bg-[#22C55E] text-white";

                if (isAbsent) {
                  cardBorder = "bg-[#EF4444]/5 border-[#EF4444]/30";
                  badgeStyle = "bg-[#EF4444] text-white";
                } else if (status === "Late") {
                  cardBorder = "bg-[#F59E0B]/5 border-[#F59E0B]/30";
                  badgeStyle = "bg-[#F59E0B] text-white";
                }

                return (
                  <div
                    key={stuId}
                    onClick={() => toggleStatus(stuId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${cardBorder}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={stu.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#1E293B]">{stu.first_name} {stu.last_name}</h4>
                        <p className="text-[10px] text-[#64748B] font-mono">{stu.enrollment_no}</p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeStyle}`}>
                      {isPresent && <UserCheck className="w-3 h-3" />}
                      {isAbsent && <UserX className="w-3 h-3" />}
                      {status === "Late" && <Clock className="w-3 h-3" />}
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Past Sessions History View */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E293B]">Conducted Attendance Sessions History</h2>
            <button
              onClick={loadPastSessions}
              className="text-xs text-[#14B8A6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} /> Refresh List
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Session Date</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Lec #</th>
                  <th className="p-3.5">Timing</th>
                  <th className="p-3.5">Topic</th>
                  <th className="p-3.5">Roster Summary</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {pastSessions.map((sess) => (
                  <tr key={sess.session_id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#1E293B]">{sess.session_date}</td>
                    <td className="p-3.5 font-semibold text-[#14B8A6]">{sess.subject_name || "Subject"}</td>
                    <td className="p-3.5">Lecture #{sess.lecture_no}</td>
                    <td className="p-3.5 font-mono text-[11px]">{sess.start_time} - {sess.end_time}</td>
                    <td className="p-3.5 font-medium">{sess.topic}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] font-bold">
                          {sess.present_count} Present
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444] font-bold">
                          {sess.absent_count} Absent
                        </span>
                        {sess.late_count > 0 && (
                          <span className="px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] font-bold">
                            {sess.late_count} Late
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleEditSession(sess.session_id)}
                        className="px-2.5 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-lg font-bold hover:bg-[#14B8A6]/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Session
                      </button>
                    </td>
                  </tr>
                ))}
                {pastSessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">
                      {loadingHistory ? "Loading conducted attendance sessions..." : "No attendance sessions recorded yet for your assigned subjects."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceMarker;
