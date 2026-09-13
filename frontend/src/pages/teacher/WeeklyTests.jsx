import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Eye, Award, CheckCircle2, Clock, Edit, Trash2, X } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherWeeklyTests = () => {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [viewResultsModal, setViewResultsModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, stuData, deptData, semData] = await Promise.all([
          teacherApi.getWeeklyTests(),
          teacherApi.getStudents(),
          teacherApi.getDepartments(),
          teacherApi.getSemesters(),
        ]);
        if (Array.isArray(testsData)) {
          setTests(testsData);
        } else if (testsData && Array.isArray(testsData.tests)) {
          setTests(testsData.tests);
          if (Array.isArray(testsData.results)) setResults(testsData.results);
        } else if (testsData && Array.isArray(testsData.exams)) {
          setTests(testsData.exams);
          if (Array.isArray(testsData.results)) setResults(testsData.results);
        }
        if (Array.isArray(stuData)) {
          setStudents(stuData);
        }
        if (Array.isArray(deptData)) {
          setDepartments(deptData);
        }
        if (Array.isArray(semData)) {
          setSemesters(semData);
        }
      } catch (err) {
        console.error("Teacher weekly tests load error:", err);
      }
    };
    fetchData();
  }, []);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("2026-08-18");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [totalMarks, setTotalMarks] = useState(25);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedSemId, setSelectedSemId] = useState("");

  const availableSemesters = semesters.filter((sem) => {
    if (!selectedDeptId) return true;
    const semDeptId = sem.department_id || sem.departmentId;
    if (!semDeptId) return true;
    return String(semDeptId) === String(selectedDeptId);
  });

  const handleOpenAddModal = () => {
    setEditingTestId(null);
    setTitle("");
    setDesc("");
    setDate("2026-08-18");
    setStartTime("10:00");
    setEndTime("11:00");
    setTotalMarks(25);
    setSelectedDeptId("");
    setSelectedSemId("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (test) => {
    const id = test.weekly_test_id || test.weekly_exam_id;
    const testDate = test.test_date || test.exam_date;
    setEditingTestId(id);
    setTitle(test.title);
    setDesc(test.description);
    setDate(testDate);
    setStartTime(test.start_time ? test.start_time.substring(0, 5) : "10:00");
    setEndTime(test.end_time ? test.end_time.substring(0, 5) : "11:00");
    setTotalMarks(test.total_marks);
    setSelectedDeptId(test.department_id || test.departmentId || "");
    setSelectedSemId(test.semester_id || test.semesterId || "");
    setShowAddModal(true);
  };

  const handleDeleteTest = async (id) => {
    if (window.confirm("Are you sure you want to delete this weekly test from database?")) {
      try {
        await teacherApi.deleteWeeklyTest(id);
        setTests((prev) => prev.filter((e) => String(e.weekly_test_id || e.weekly_exam_id) !== String(id)));
        notifySuccess("Weekly test deleted successfully from database!");
      } catch (err) {
        console.error("Error deleting weekly test:", err);
        notifyError("Failed to delete weekly test from database.");
      }
    }
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
    const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

    const payload = {
      title,
      description: desc,
      test_date: date,
      exam_date: date,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      total_marks: Number(totalMarks),
      department_id: selectedDeptId || null,
      semester_id: selectedSemId || null,
    };

    try {
      if (editingTestId) {
        await teacherApi.updateWeeklyTest(editingTestId, payload);
        notifySuccess(`Weekly test '${title}' updated in database successfully!`);
      } else {
        await teacherApi.createWeeklyTest(payload);
        notifySuccess(`Weekly test '${title}' saved to database successfully!`);
      }

      // Refresh test list from database
      const testsData = await teacherApi.getWeeklyTests();
      if (Array.isArray(testsData)) {
        setTests(testsData);
      } else if (testsData && Array.isArray(testsData.tests)) {
        setTests(testsData.tests);
      } else if (testsData && Array.isArray(testsData.exams)) {
        setTests(testsData.exams);
      }
    } catch (err) {
      console.error("Error saving weekly test to database:", err);
      notifyError("Failed to save weekly test to database.");
    }

    setShowAddModal(false);
    setEditingTestId(null);
  };

  const handleOpenResultsModal = async (test) => {
    setViewResultsModal(test);
    const testId = test?.weekly_test_id || test?.weekly_exam_id;
    if (testId) {
      try {
        const resData = await teacherApi.getWeeklyTestResults(testId);
        if (Array.isArray(resData)) {
          setResults(resData);
        }
      } catch (err) {
        console.error("Error fetching weekly test results from database:", err);
      }
    }
  };

  const handleMarksChange = (studentId, value) => {
    setResults((prev) =>
      prev.map((r) =>
        r.student_id === studentId ? { ...r, obtained_marks: value === "" ? "" : Number(value) } : r
      )
    );
  };

  const handleRemarksChange = (studentId, value) => {
    setResults((prev) =>
      prev.map((r) =>
        r.student_id === studentId ? { ...r, remarks: value } : r
      )
    );
  };

  const handleSaveResults = async () => {
    const testId = viewResultsModal?.weekly_test_id || viewResultsModal?.weekly_exam_id;
    if (!testId) return;
    try {
      await teacherApi.saveWeeklyTestResults(testId, results);
      notifySuccess(`Weekly test marks saved to database for '${viewResultsModal.title}'!`);
      setViewResultsModal(null);
    } catch (err) {
      console.error("Error saving weekly test results:", err);
      notifyError("Failed to save weekly test marks to database.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Weekly Tests</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Add New Weekly Test
        </Button>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tests.map((test) => {
          const testId = test.weekly_test_id || test.weekly_exam_id;
          const testDate = test.test_date || test.exam_date;
          return (
            <div key={testId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-[11px]">
                    Test Date: {testDate}
                  </span>
                  <span className="font-bold text-[#14B8A6]">Total Marks: {test.total_marks}</span>
                </div>

                {(test.department_name || test.department_code || test.semester_name || test.semester_code) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(test.department_name || test.department_code) && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] text-[10px] font-bold">
                        Dept: {test.department_code || test.department_name}
                      </span>
                    )}
                    {(test.semester_name || test.semester_code) && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#14B8A6] text-[10px] font-bold">
                        {test.semester_name || `Semester ${test.semester_code}`}
                      </span>
                    )}
                  </div>
                )}

                <h3 className="text-sm font-bold text-[#1E293B]">{test.title}</h3>
                <p className="text-[#64748B]">{test.description}</p>

                {/* Start & End Timing Info */}
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-1.5 text-xs text-[#1E293B] font-mono font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Test Schedule: {test.start_time} to {test.end_time}</span>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleOpenResultsModal(test)}
                  className="text-xs"
                >
                  Grade / Enter Student Marks
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleOpenEditModal(test)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteTest(testId)}
                    className="text-xs !bg-[#EF4444]/10 !text-[#EF4444] hover:!bg-[#EF4444] hover:!text-white border-transparent"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editingTestId ? "Edit Weekly Test Details" : "Create Weekly Test"}
            </h3>

            <form onSubmit={handleSaveTest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Test Title (title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Test 3: SQL Architecture"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Description (description)</label>
                <textarea
                  rows={2}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide test summary or scope..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Target Department</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setSelectedSemId("");
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] text-xs cursor-pointer"
                  >
                    <option value="">-- All Departments --</option>
                    {departments.map((d) => (
                      <option key={d.department_id || d.departmentId} value={d.department_id || d.departmentId}>
                        {d.department_code || d.department_name} ({d.department_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Target Semester</label>
                  <select
                    value={selectedSemId}
                    onChange={(e) => setSelectedSemId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] text-xs cursor-pointer"
                  >
                    <option value="">-- All Semesters --</option>
                    {availableSemesters.map((s) => (
                      <option key={s.semester_id || s.semesterId} value={s.semester_id || s.semesterId}>
                        {s.semester_name || `Semester ${s.semester_no || s.semesterNo}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Test Date (test_date)</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Total Marks (total_marks)</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              {/* Start & End Time Controls */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <div>
                  <label className="block text-[#1E293B] mb-1 font-bold">Start Time (start_time)</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#1E293B] mb-1 font-bold">End Time (end_time)</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  {editingTestId ? "Save Changes" : "Save Test"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results / Grade Marks Modal */}
      {viewResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">
                  Class Test Results & Grading ({viewResultsModal.title})
                </h3>
                <p className="text-xs text-[#64748B] flex flex-wrap items-center gap-2 mt-1">
                  <span>Total Marks: {viewResultsModal.total_marks} • Test Date: {viewResultsModal.test_date || viewResultsModal.exam_date}</span>
                  {(viewResultsModal.department_name || viewResultsModal.department_code) && (
                    <span className="px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] font-bold text-[10px]">
                      Dept: {viewResultsModal.department_code || viewResultsModal.department_name}
                    </span>
                  )}
                  {(viewResultsModal.semester_name || viewResultsModal.semester_code) && (
                    <span className="px-2 py-0.5 rounded bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[10px]">
                      {viewResultsModal.semester_name || `Semester ${viewResultsModal.semester_code}`}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setViewResultsModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar pr-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] sticky top-0">
                  <tr>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Enrollment No</th>
                    <th className="p-2.5 w-28">Marks ({viewResultsModal.total_marks})</th>
                    <th className="p-2.5 w-16 text-center">Grade</th>
                    <th className="p-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#64748B] italic">
                        No students found matching the selected department and semester.
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => {
                    const om = r.obtained_marks;
                    let grade = r.grade || "-";
                    if (om !== null && om !== "" && !isNaN(om)) {
                      const pct = (Number(om) / (viewResultsModal.total_marks || 25)) * 100;
                      if (pct >= 90) grade = "A+";
                      else if (pct >= 80) grade = "A";
                      else if (pct >= 70) grade = "B+";
                      else if (pct >= 60) grade = "B";
                      else if (pct >= 50) grade = "C";
                      else if (pct >= 40) grade = "D";
                      else grade = "F";
                    }
                    return (
                      <tr key={r.student_id} className="hover:bg-[#F8FAFC]">
                        <td className="p-2.5 font-bold text-[#1E293B]">{r.student_name}</td>
                        <td className="p-2.5 font-mono text-[#2563EB] font-bold">{r.enrollment_no}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            max={viewResultsModal.total_marks}
                            value={r.obtained_marks ?? ""}
                            onChange={(e) => handleMarksChange(r.student_id, e.target.value)}
                            placeholder="Score"
                            className="w-full p-1.5 rounded border border-[#E2E8F0] font-bold text-[#2563EB] bg-white focus:outline-none focus:border-[#2563EB]"
                          />
                        </td>
                        <td className="p-2.5 font-extrabold text-[#22C55E] text-center">{grade}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={r.remarks || ""}
                            onChange={(e) => handleRemarksChange(r.student_id, e.target.value)}
                            placeholder="Optional feedback..."
                            className="w-full p-1.5 rounded border border-[#E2E8F0] text-[#64748B] bg-white focus:outline-none focus:border-[#2563EB]"
                          />
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0] shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewResultsModal(null)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleSaveResults}>
                Save Class Marks
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWeeklyTests;

