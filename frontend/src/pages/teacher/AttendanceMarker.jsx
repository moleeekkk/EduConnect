import React, { useState, useEffect } from "react";
import { CalendarCheck, Save, CheckCircle2, UserCheck, UserX } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi, adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherAttendanceMarker = () => {
  const [selectedSubject, setSelectedSubject] = useState("subj-101");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [lectureNo, setLectureNo] = useState(1);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("11:00");
  const [topic, setTopic] = useState("State Management & Custom Hooks Architecture");

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentStatus, setStudentStatus] = useState({});
  const [saveMsg, setSaveMsg] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stuData, subData] = await Promise.all([
          teacherApi.getStudents(),
          adminApi.getSubjects(),
        ]);
        if (Array.isArray(stuData)) {
          const cleaned = stuData.filter((s) => {
            const email = (s.email || "").toLowerCase();
            const fullName = `${s.first_name || s.firstName || ""} ${s.last_name || s.lastName || ""}`.toLowerCase();
            return email !== "alex.johnson@educonnect.ac.in" && !fullName.includes("alex johnson");
          });
          setStudents(cleaned);
          const initialStatus = {};
          cleaned.forEach((s) => {
            initialStatus[s.student_id || s.id] = "Present";
          });
          setStudentStatus(initialStatus);
        }
        if (Array.isArray(subData)) {
          setSubjects(subData);
          if (subData[0]?.subject_id) setSelectedSubject(subData[0].subject_id);
        }
      } catch (err) {
        console.error("AttendanceMarker load error:", err);
      }
    };
    fetchData();
  }, []);

  const toggleStatus = (id) => {
    setStudentStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      const attendanceData = {
        subject_id: selectedSubject,
        session_date: sessionDate,
        lecture_number: lectureNo,
        start_time: startTime,
        end_time: endTime,
        topic_covered: topic,
        records: Object.entries(studentStatus).map(([student_id, status]) => ({
          student_id,
          status,
        })),
      };
      await teacherApi.markAttendance(attendanceData);
      setSaveMsg(true);
      notifySuccess(`Attendance for ${students.length || 0} students recorded & saved to database!`);
      setTimeout(() => setSaveMsg(false), 3000);
    } catch (err) {
      console.error("Save attendance error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save attendance.";
      notifyError(`Failed to save attendance to database: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Attendance Marker</h1>
        </div>

        <Button variant="accent" size="sm" icon={Save} onClick={handleSaveAttendance} className="text-xs">
          Save Attendance Record
        </Button>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Lecture session and attendance saved successfully!
        </div>
      )}

      {/* Session Config Form */}
      <form onSubmit={handleSaveAttendance} className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">Session Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[#64748B] mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            >
              {subjects.map((s) => (
                <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                  {s.subject_name || s.name} ({s.subject_code || s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">Lecture Date (session_date)</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">Lecture No (lecture_no)</label>
            <input
              type="number"
              value={lectureNo}
              onChange={(e) => setLectureNo(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">Start Time (start_time)</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">End Time (end_time)</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#64748B] mb-1">Lecture Topic Covered (topic)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
          />
        </div>
      </form>

      {/* Student Roster List for Marking */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Class Student Roster</h2>
          <span className="text-xs text-[#64748B]">Click on any student card to toggle Present / Absent</span>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map((stu) => {
            const stuId = stu.student_id || stu.id;
            const status = studentStatus[stuId] || "Present";
            const isPresent = status === "Present";
            return (
              <div
                key={stuId}
                onClick={() => toggleStatus(stuId)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isPresent
                    ? "bg-[#22C55E]/5 border-[#22C55E]/30"
                    : "bg-[#EF4444]/5 border-[#EF4444]/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={stu.profile_photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B]">{stu.first_name} {stu.last_name}</h4>
                    <p className="text-[10px] text-[#64748B] font-mono">{stu.enrollment_no}</p>
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
      </div>
    </div>
  );
};

export default TeacherAttendanceMarker;
