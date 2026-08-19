import React, { useState } from "react";
import { Save, CheckCircle2, UserCheck, UserX } from "lucide-react";
import Button from "../../components/common/Button";
import { mockStudents, mockSubjects } from "../../data/mockData";

const TeacherAttendanceMarker = () => {
  const [selectedSubject, setSelectedSubject] = useState(mockSubjects[0]?.subject_id || "");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [lectureNo, setLectureNo] = useState(1);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("11:00");
  const [topic, setTopic] = useState("");

  const [studentStatus, setStudentStatus] = useState({});

  const [saveMsg, setSaveMsg] = useState(false);

  const toggleStatus = (id) => {
    setStudentStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "Absent" ? "Present" : "Absent",
    }));
  };

  const handleSaveAttendance = (e) => {
    e.preventDefault();
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 3000);
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
              {mockSubjects && mockSubjects.length > 0 ? (
                mockSubjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name} ({s.subject_code})
                  </option>
                ))
              ) : (
                <option value="">No Subjects</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">Lecture Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">Lecture No</label>
            <input
              type="number"
              value={lectureNo}
              onChange={(e) => setLectureNo(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-[#64748B] mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#64748B] mb-1">Lecture Topic Covered</label>
          <input
            type="text"
            value={topic}
            placeholder="e.g. Topic description..."
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
          />
        </div>
      </form>

      {/* Student Roster List for Marking */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Class Student Roster</h2>
        </div>

        {mockStudents && mockStudents.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockStudents.map((stu) => {
              const status = studentStatus[stu.student_id] || "Present";
              const isPresent = status === "Present";
              return (
                <div
                  key={stu.student_id}
                  onClick={() => toggleStatus(stu.student_id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isPresent
                      ? "bg-[#22C55E]/5 border-[#22C55E]/30"
                      : "bg-[#EF4444]/5 border-[#EF4444]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
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
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B]">
            No students found in class roster.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendanceMarker;
