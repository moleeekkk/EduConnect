import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, UserCheck, UserX, Eye, X, Clock, Calendar, Plus } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherAttendanceMarker = () => {
  const [selectedSubject, setSelectedSubject] = useState("subj-101");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("11:00");

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [studentStatus, setStudentStatus] = useState({});
  const [saveMsg, setSaveMsg] = useState(false);

  // Saved Attendance History & Modals State
  const [savedSessions, setSavedSessions] = useState([]);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const getLoggedIdentifier = () => {
    const userStr = localStorage.getItem("educonnect_user");
    const loggedUser = userStr ? JSON.parse(userStr) : null;
    return loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;
  };

  const loadSavedSessions = async (identifier) => {
    try {
      const sessData = await teacherApi.getAttendanceSessions(identifier);
      if (Array.isArray(sessData)) {
        setSavedSessions(sessData);
      }
    } catch (err) {
      console.error("Error loading saved sessions:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const identifier = getLoggedIdentifier();
      try {
        const [stuData, subData, deptData, semData] = await Promise.all([
          teacherApi.getStudents(),
          teacherApi.getAssignedSubjects(identifier),
          teacherApi.getDepartments(),
          teacherApi.getSemesters(),
        ]);
        if (Array.isArray(stuData)) {
          setStudents(stuData);
          const initialStatus = {};
          stuData.forEach((s) => {
            initialStatus[s.student_id || s.id] = "Present";
          });
          setStudentStatus(initialStatus);
        }
        if (Array.isArray(subData)) {
          setSubjects(subData);
          if (subData[0]?.subject_id || subData[0]?.id) setSelectedSubject(subData[0].subject_id || subData[0].id);
        }
        if (Array.isArray(deptData)) {
          setDepartments(deptData);
        }
        if (Array.isArray(semData)) {
          setSemesters(semData);
        }

        loadSavedSessions(identifier);
      } catch (err) {
        console.error("AttendanceMarker load error:", err);
      }
    };
    fetchData();
  }, []);

  const handleDepartmentChange = (deptId) => {
    setSelectedDepartment(deptId);
    if (deptId !== "all") {
      const validSems = semesters.filter(
        (s) => String(s.department_id || s.departmentId || s.program_id || s.id || "") === String(deptId)
      );
      const isValid = validSems.some((s) => String(s.semester_id || s.id) === String(selectedSemester));
      if (!isValid) {
        setSelectedSemester("all");
      }
    }
  };

  const availableSemesters = selectedDepartment === "all"
    ? semesters
    : semesters.filter(
      (s) => String(s.department_id || s.departmentId || s.program_id || s.id || "") === String(selectedDepartment)
    );

  const filteredStudents = students.filter((stu) => {
    const stuDept = String(stu.department_id || stu.departmentId || "");
    const deptMatch = selectedDepartment === "all" || !stuDept || stuDept === String(selectedDepartment);

    const stuSem = String(stu.semester_id || stu.semesterId || "");
    const semMatch = selectedSemester === "all" || !stuSem || stuSem === String(selectedSemester);

    return deptMatch && semMatch;
  });

  const toggleStatus = (id) => {
    setStudentStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));
  };

  const handleSaveAttendance = async (e) => {
    if (e) e.preventDefault();
    try {
      const attendanceData = {
        subject_id: selectedSubject,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        records: filteredStudents.map((s) => {
          const stuId = s.student_id || s.id;
          return {
            student_id: stuId,
            status: studentStatus[stuId] || "Present",
          };
        }),
      };

      const res = await teacherApi.markAttendance(attendanceData);
      if (res && res.success === false) {
        notifyError(res.message || "Attendance session for this time slot on this date has already been saved!");
        return;
      }

      setSaveMsg(true);
      notifySuccess(`Attendance for ${filteredStudents.length || 0} student(s) saved successfully!`);
      setIsMarkModalOpen(false);
      setTimeout(() => setSaveMsg(false), 3500);

      loadSavedSessions(getLoggedIdentifier());
    } catch (err) {
      console.error("Save attendance error:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to save attendance.";
      notifyError(`Failed to save attendance: ${msg}`);
    }
  };

  const handleOpenViewModal = async (sessionId) => {
    setIsViewModalOpen(true);
    setModalLoading(true);
    try {
      const details = await teacherApi.getAttendanceSessionDetails(sessionId);
      setSelectedSessionDetails(details);
    } catch (err) {
      console.error("Session details load error:", err);
      notifyError("Failed to fetch lecture attendance details.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Mark Attendance Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#1E293B]">Attendance Marker</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={() => setIsMarkModalOpen(true)} className="text-xs">
          Mark Attendance
        </Button>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Lecture session attendance record saved to database successfully!
        </div>
      )}

      {/* Main Page Content: Saved Attendance History */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F172A]" /> Saved Attendance History ({savedSessions.length} Sessions)
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">Click on any lecture session card to view detailed student attendance list</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSessions.length > 0 ? (
            savedSessions.map((sess) => (
              <div
                key={sess.session_id}
                onClick={() => handleOpenViewModal(sess.session_id)}
                className="bg-[#F8FAFC] hover:bg-white p-4 rounded-xl border border-[#E2E8F0] hover:border-[#0F172A]/40 transition-all cursor-pointer shadow-2xs hover:shadow-xs group space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#0F172A] text-white font-mono text-[10px] font-semibold">
                    {sess.subject_code || "SUBJ"}
                  </span>
                  <span className="text-[10px] font-semibold text-[#64748B] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#64748B]" /> {sess.session_date}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#1E293B] group-hover:text-[#0F172A] line-clamp-1">
                    {sess.subject_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{sess.start_time} - {sess.end_time}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[#22C55E] font-bold text-[11px] flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Present: {sess.present_count || 0}
                    </span>
                    <span className="text-[#EF4444] font-bold text-[11px] flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" /> Absent: {sess.absent_count || 0}
                    </span>
                  </div>

                  <span className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <p className="text-xs text-[#64748B]">No saved attendance records found for your logged-in account yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL 1: Mark Attendance Pop-up Modal */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Mark Class Attendance</h3>
                <p className="text-xs text-[#64748B]">Configure session parameters and mark student attendance</p>
              </div>
              <button
                onClick={() => setIsMarkModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Parameters Form */}
            <form onSubmit={handleSaveAttendance} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-4 text-xs">
              <h4 className="text-xs font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">Session Parameters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {/* 1. Select Department */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white font-semibold text-[#1E293B]"
                  >
                    <option value="all">All Departments ({departments.length})</option>
                    {departments.map((d) => (
                      <option key={d.department_id || d.id} value={d.department_id || d.id}>
                        {d.department_code || d.code} - {d.department_name || d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Semester */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white font-semibold text-[#1E293B]"
                  >
                    <option value="all">All Semesters ({availableSemesters.length})</option>
                    {availableSemesters.map((sem) => (
                      <option key={sem.semester_id || sem.id} value={sem.semester_id || sem.id}>
                        {sem.semester_name || `Semester ${sem.semester_number || sem.number}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Select Subject (assigned) */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Assigned Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white font-semibold text-[#1E293B]"
                  >
                    {subjects.map((s) => (
                      <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                        {s.subject_name || s.name} ({s.subject_code || s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Lecture Date */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Lecture Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] font-medium"
                  />
                </div>

                {/* 5. Start Time Selector */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] font-medium"
                  />
                </div>

                {/* 6. End Time Selector */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] font-medium"
                  />
                </div>
              </div>
            </form>

            {/* Class Student Roster inside Popup Modal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <h4 className="text-xs font-bold text-[#1E293B]">
                  Class Student Roster ({filteredStudents.length} Students)
                </h4>
                <p className="text-[11px] text-[#64748B]">Click card to toggle Present / Absent status</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((stu) => {
                    const stuId = stu.student_id || stu.id;
                    const status = studentStatus[stuId] || "Present";
                    const isPresent = status === "Present";
                    return (
                      <div
                        key={stuId}
                        onClick={() => toggleStatus(stuId)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isPresent
                          ? "bg-[#22C55E]/5 border-[#22C55E]/30 hover:border-[#22C55E]/60"
                          : "bg-[#EF4444]/5 border-[#EF4444]/30 hover:border-[#EF4444]/60"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={stu.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#1E293B]">{stu.first_name} {stu.last_name}</h4>
                            <p className="text-[10px] text-[#64748B] font-mono">{stu.enrollment_no}</p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${isPresent ? "bg-[#22C55E] text-white" : "bg-[#EF4444] text-white"
                            }`}
                        >
                          {isPresent ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B]">No students found matching the selected department & semester filter.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsMarkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button variant="accent" size="sm" icon={Save} onClick={handleSaveAttendance} className="text-xs">
                Save Attendance Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: View Session Attendance Details Pop-up Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Lecture Attendance Details</h3>
                <p className="text-xs text-[#64748B]">Recorded student attendance list for this session</p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedSessionDetails(null);
                }}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 text-center text-xs text-[#64748B]">Loading lecture attendance records...</div>
            ) : selectedSessionDetails ? (
              <div className="space-y-4">
                {/* Session Details Header */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] text-[10px] block">Subject</span>
                    <span className="font-bold text-[#1E293B]">{selectedSessionDetails.subject_name} ({selectedSessionDetails.subject_code})</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[10px] block">Lecture Date</span>
                    <span className="font-bold text-[#1E293B]">{selectedSessionDetails.session_date}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[10px] block">Session Slot</span>
                    <span className="font-bold text-[#1E293B]">{selectedSessionDetails.start_time} - {selectedSessionDetails.end_time}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[10px] block">Status Summary</span>
                    <div className="flex items-center gap-2 font-bold text-[11px] mt-0.5">
                      <span className="text-[#22C55E]">Present: {selectedSessionDetails.present_count || 0}</span>
                      <span className="text-[#EF4444]">Absent: {selectedSessionDetails.absent_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Enrolled Students List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1E293B]">Recorded Students ({selectedSessionDetails.records?.length || 0})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                    {selectedSessionDetails.records?.length > 0 ? (
                      selectedSessionDetails.records.map((rec) => {
                        const isPresent = rec.status === "Present";
                        return (
                          <div
                            key={rec.student_id}
                            className={`p-3 rounded-xl border flex items-center justify-between ${isPresent ? "bg-[#22C55E]/5 border-[#22C55E]/20" : "bg-[#EF4444]/5 border-[#EF4444]/20"
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={rec.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-xs font-bold text-[#1E293B]">{rec.student_name || "Student"}</p>
                                <p className="text-[10px] text-[#64748B] font-mono">{rec.enrollment_no || "N/A"}</p>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${isPresent ? "bg-[#22C55E] text-white" : "bg-[#EF4444] text-white"
                                }`}
                            >
                              {isPresent ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                              {rec.status}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-[#64748B] py-4 col-span-full text-center">No student records found for this lecture session.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#64748B]">Session details unavailable.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceMarker;
