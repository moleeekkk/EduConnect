import React, { useState, useEffect } from "react";
import { Plus, Eye, Clock, Edit, Trash2, X, Save, RefreshCw, CheckCircle2 } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";

const TeacherWeeklyTests = () => {
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [students, setStudents] = useState([]);

  const [exams, setExams] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [viewResultsModal, setViewResultsModal] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [totalMarks, setTotalMarks] = useState(25);

  const [studentMarksMap, setStudentMarksMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [isSavingMarks, setIsSavingMarks] = useState(false);

  const loadAssignedSubjects = async () => {
    try {
      const data = await teacherApi.getMyAssignedSubjects();
      const list = Array.isArray(data) ? data : [];
      setAssignedSubjects(list);
      if (list.length > 0) {
        const firstId = list[0].allocation_id || list[0].allocationId;
        setSelectedSubjectId(firstId);
      }
    } catch (err) {
      console.log("Error loading subjects:", err);
    }
  };

  const loadStudents = async (allocId) => {
    if (!allocId) return;
    try {
      setLoadingStudents(true);
      const data = await teacherApi.getApplicableStudentsForAllocation(allocId);
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
    } catch (err) {
      console.log("Error loading student roster:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadAssignedSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadStudents(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const handleOpenAddModal = () => {
    setEditingExamId(null);
    setTitle("");
    setDesc("");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("10:00");
    setEndTime("11:00");
    setTotalMarks(25);
    setShowAddModal(true);
  };

  const handleOpenResultsModal = async (exam) => {
    setViewResultsModal(exam);
    // Fetch existing results for this exam if any
    try {
      const existingResults = await teacherApi.getExamResults(selectedSubjectId, exam.title);
      const initialMap = {};
      (existingResults || []).forEach((r) => {
        const stId = r.student_id || r.studentId;
        initialMap[stId] = r.obtained_marks || r.obtainedMarks || 0;
      });
      setStudentMarksMap(initialMap);
    } catch (err) {
      setStudentMarksMap({});
    }
  };

  const handleSaveTest = (e) => {
    e.preventDefault();
    const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
    const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

    const created = {
      weekly_exam_id: `wexam-${Date.now()}`,
      title,
      description: desc,
      exam_date: date,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      total_marks: Number(totalMarks),
      created_at: new Date().toISOString(),
    };

    setExams([created, ...exams]);
    setShowAddModal(false);
  };

  const handleMarkChange = (studentId, value) => {
    setStudentMarksMap((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveStudentMarks = async () => {
    if (!viewResultsModal) return;
    try {
      setIsSavingMarks(true);
      const maxM = Number(viewResultsModal.total_marks || 25);
      const studentMarksList = [];

      for (const [stId, val] of Object.entries(studentMarksMap)) {
        const obt = Number(val);
        if (isNaN(obt)) continue;
        if (obt < 0 || obt > maxM) {
          alert(`Validation Error: Marks for student must be between 0 and maximum marks (${maxM})`);
          setIsSavingMarks(false);
          return;
        }
        studentMarksList.push({
          studentId: stId,
          obtainedMarks: obt
        });
      }

      const payload = {
        allocationId: selectedSubjectId,
        teacherSubjectId: selectedSubjectId,
        examName: viewResultsModal.title,
        examDate: viewResultsModal.exam_date,
        maximumMarks: maxM,
        studentMarks: studentMarksList
      };

      const res = await teacherApi.saveExamMarks(payload);
      setSaveMsg(res.message || "Exam marks saved successfully in PostgreSQL!");
      setTimeout(() => setSaveMsg(""), 4000);
      setViewResultsModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save marks to PostgreSQL");
    } finally {
      setIsSavingMarks(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Weekly Tests & Exam Evaluation</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Evaluate class test marks and compute grades in PostgreSQL database.</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Add New Weekly Test
        </Button>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {saveMsg}
        </div>
      )}

      {/* Class Subject Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
        <label className="text-xs font-bold text-[#1E293B]">Assigned Class / Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#1E293B]"
        >
          {assignedSubjects && assignedSubjects.length > 0 ? (
            assignedSubjects.map((s) => (
              <option key={s.allocation_id || s.subject_id} value={s.allocation_id || s.subject_id}>
                {s.subject_name || s.subjectName} ({s.subject_code || s.subjectCode}) • Sem {s.semester_number || s.semesterNumber}
              </option>
            ))
          ) : (
            <option value="">No Assigned Subjects</option>
          )}
        </select>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {exams && exams.length > 0 ? (
          exams.map((exam) => (
            <div key={exam.weekly_exam_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-[11px]">
                    Exam Date: {exam.exam_date}
                  </span>
                  <span className="font-bold text-[#14B8A6]">Total Marks: {exam.total_marks}</span>
                </div>

                <h3 className="text-sm font-bold text-[#1E293B]">{exam.title}</h3>
                <p className="text-[#64748B]">{exam.description}</p>

                <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-1.5 text-xs text-[#1E293B] font-mono font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Exam Schedule: {exam.start_time} to {exam.end_time}</span>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleOpenResultsModal(exam)}
                  className="text-xs"
                >
                  Enter & View Student Results
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs col-span-full">
            No weekly tests scheduled yet. Click "Add New Weekly Test" above to schedule an exam.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Create Weekly Test
            </h3>

            <form onSubmit={handleSaveTest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Test Title / Exam Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quiz 1 - React Components..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Exam scope..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Exam
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results / Marks Entry Modal */}
      {viewResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">
                  Class Exam Marks Entry ({viewResultsModal.title})
                </h3>
                <p className="text-xs text-[#64748B]">Max Marks: {viewResultsModal.total_marks}</p>
              </div>
              <button
                onClick={() => setViewResultsModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingStudents ? (
              <div className="p-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#14B8A6]" /> Fetching student roster from database...
              </div>
            ) : students && students.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-[50vh] overflow-y-auto border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Enrollment No</th>
                        <th className="p-3">Obtained Marks (Max: {viewResultsModal.total_marks})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {students.map((stu) => {
                        const sId = stu.student_id || stu.studentId;
                        const currentVal = studentMarksMap[sId] !== undefined ? studentMarksMap[sId] : "";
                        return (
                          <tr key={sId} className="hover:bg-[#F8FAFC]">
                            <td className="p-3 font-bold text-[#1E293B]">{stu.name || `${stu.first_name || ""} ${stu.last_name || ""}`}</td>
                            <td className="p-3 font-mono text-[#64748B]">{stu.enrollment_no || stu.enrollmentNo}</td>
                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                max={viewResultsModal.total_marks}
                                value={currentVal}
                                onChange={(e) => handleMarkChange(sId, e.target.value)}
                                placeholder="0"
                                className="w-24 p-2 rounded-lg border border-[#E2E8F0] bg-white font-bold text-center text-[#2563EB]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <Button variant="outline" size="sm" onClick={() => setViewResultsModal(null)}>Cancel</Button>
                  <Button variant="accent" size="sm" icon={Save} onClick={handleSaveStudentMarks} disabled={isSavingMarks}>
                    {isSavingMarks ? "Saving..." : "Save Marks to PostgreSQL"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#64748B]">
                No students found in this class roster.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWeeklyTests;
