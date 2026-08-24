import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, UserCheck, UserX, RefreshCw } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";

const TeacherAttendanceMarker = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [lectureNo, setLectureNo] = useState(1);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("11:00");
  const [topic, setTopic] = useState("");

  const [studentStatus, setStudentStatus] = useState({});
  const [saveMsg, setSaveMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Assigned Subjects for current teacher
  const loadAssignedSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const data = await teacherApi.getMyAssignedSubjects();
      const list = Array.isArray(data) ? data : [];
      setSubjects(list);

      if (list.length > 0) {
        const defaultSubId = list[0].allocation_id || list[0].allocationId || list[0].subject_id;
        setSelectedSubject(defaultSubId);
      }
    } catch (err) {
      console.log("Error fetching assigned subjects:", err);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Load Authorized Students for selected subject/allocation
  const loadStudentsForSubject = async (allocId) => {
    if (!allocId) return;
    try {
      setLoadingStudents(true);
      const data = await teacherApi.getApplicableStudentsForAllocation(allocId);
      const list = Array.isArray(data) ? data : [];
      setStudents(list);

      // Default all to Present
      const initialStatus = {};
      list.forEach((s) => {
        const sId = s.student_id || s.studentId;
        initialStatus[sId] = "Present";
      });
      setStudentStatus(initialStatus);
    } catch (err) {
      console.log("Error loading students for subject:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadAssignedSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadStudentsForSubject(selectedSubject);
    }
  }, [selectedSubject]);

  const toggleStatus = (id) => {
    setStudentStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "Absent" ? "Present" : "Absent",
    }));
  };

  const handleSaveAttendance = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSubject) return;

    try {
      setIsSubmitting(true);
      const studentStatusesList = Object.entries(studentStatus).map(([studentId, status]) => ({
        studentId: studentId,
        status: status,
      }));

      const payload = {
        allocationId: selectedSubject,
        teacherSubjectId: selectedSubject,
        sessionDate: sessionDate,
        lectureNo: parseInt(lectureNo) || 1,
        startTime: startTime,
        endTime: endTime,
        topic: topic.trim() || "Lecture Session",
        studentStatuses: studentStatusesList,
        studentStatusMap: studentStatus,
      };

      const res = await teacherApi.markAttendance(payload);
      setSaveMsg(res.message || "Lecture session and attendance saved successfully in PostgreSQL!");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save attendance record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Attendance Marker</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Record and save class attendance directly to PostgreSQL database.</p>
        </div>

        <Button variant="accent" size="sm" icon={Save} onClick={handleSaveAttendance} disabled={isSubmitting} className="text-xs">
          {isSubmitting ? "Saving to DB..." : "Save Attendance Record"}
        </Button>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {saveMsg}
        </div>
      )}

      {/* Session Config Form */}
      <form onSubmit={handleSaveAttendance} className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">Session Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[#64748B] mb-1 font-semibold">Assigned Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            >
              {loadingSubjects ? (
                <option value="">Loading assigned subjects...</option>
              ) : subjects && subjects.length > 0 ? (
                subjects.map((s) => (
                  <option key={s.allocation_id || s.subject_id} value={s.allocation_id || s.subject_id}>
                    {s.subject_name || s.subjectName} ({s.subject_code || s.subjectCode}) • Sem {s.semester_number || s.semesterNumber}
                  </option>
                ))
              ) : (
                <option value="">No Assigned Subjects Found</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[#64748B] mb-1 font-semibold">Lecture Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1 font-semibold">Lecture No</label>
            <input
              type="number"
              value={lectureNo}
              onChange={(e) => setLectureNo(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1 font-semibold">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1 font-semibold">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#64748B] mb-1 font-semibold">Lecture Topic Covered</label>
          <input
            type="text"
            value={topic}
            placeholder="e.g. React hooks & State Management..."
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
          />
        </div>
      </form>

      {/* Student Roster List for Marking */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Class Student Roster ({students.length} Enrolled Students)</h2>
        </div>

        {loadingStudents ? (
          <div className="p-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#14B8A6]" /> Loading authorized student roster from database...
          </div>
        ) : students && students.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((stu) => {
              const sId = stu.student_id || stu.studentId;
              const status = studentStatus[sId] || "Present";
              const isPresent = status === "Present";
              return (
                <div
                  key={sId}
                  onClick={() => toggleStatus(sId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isPresent
                      ? "bg-[#22C55E]/5 border-[#22C55E]/30"
                      : "bg-[#EF4444]/5 border-[#EF4444]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">{stu.name || `${stu.first_name || ""} ${stu.last_name || ""}`}</h4>
                      <p className="text-[10px] text-[#64748B] font-mono">{stu.enrollment_no || stu.enrollmentNo}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isPresent ? "bg-[#22C55E] text-white" : "bg-[#EF4444] text-white"
                    }`}
                  >
                    {isPresent ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B]">
            No authorized students found in this assigned class roster.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendanceMarker;
