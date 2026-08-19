import React, { useState } from "react";
import { Plus, Eye, Clock, Edit, Trash2, X } from "lucide-react";
import Button from "../../components/common/Button";
import { mockWeeklyExams, mockWeeklyExamResults, mockStudents } from "../../data/mockData";

const TeacherWeeklyTests = () => {
  const [exams, setExams] = useState(mockWeeklyExams || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [viewResultsModal, setViewResultsModal] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [totalMarks, setTotalMarks] = useState(25);

  const handleOpenAddModal = () => {
    setEditingExamId(null);
    setTitle("");
    setDesc("");
    setDate("");
    setStartTime("10:00");
    setEndTime("11:00");
    setTotalMarks(25);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (exam) => {
    setEditingExamId(exam.weekly_exam_id);
    setTitle(exam.title);
    setDesc(exam.description);
    setDate(exam.exam_date);
    setStartTime(exam.start_time ? exam.start_time.substring(0, 5) : "10:00");
    setEndTime(exam.end_time ? exam.end_time.substring(0, 5) : "11:00");
    setTotalMarks(exam.total_marks);
    setShowAddModal(true);
  };

  const handleDeleteTest = (id) => {
    if (window.confirm("Are you sure you want to delete this weekly test?")) {
      setExams(exams.filter((e) => e.weekly_exam_id !== id));
    }
  };

  const handleSaveTest = (e) => {
    e.preventDefault();
    const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
    const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

    if (editingExamId) {
      setExams(
        exams.map((ex) =>
          ex.weekly_exam_id === editingExamId
            ? {
                ...ex,
                title,
                description: desc,
                exam_date: date,
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                total_marks: Number(totalMarks),
                updated_at: new Date().toISOString(),
              }
            : ex
        )
      );
    } else {
      const created = {
        weekly_exam_id: `wexam-${Date.now()}`,
        title,
        description: desc,
        exam_date: date,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        total_marks: Number(totalMarks),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setExams([created, ...exams]);
    }

    setShowAddModal(false);
    setEditingExamId(null);
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
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => setViewResultsModal(exam)}
                  className="text-xs"
                >
                  View Student Results
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleOpenEditModal(exam)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteTest(exam.weekly_exam_id)}
                    className="text-xs !bg-[#EF4444]/10 !text-[#EF4444] hover:!bg-[#EF4444] hover:!text-white border-transparent"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs col-span-full">
            No weekly tests scheduled yet.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editingExamId ? "Edit Weekly Test Details" : "Create Weekly Test"}
            </h3>

            <form onSubmit={handleSaveTest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Test Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Title..."
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
                  placeholder="Summary..."
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
                  {editingExamId ? "Save Changes" : "Save Exam"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {viewResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#1E293B]">
                Class Exam Results ({viewResultsModal.title})
              </h3>
              <button
                onClick={() => setViewResultsModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="p-2">Student</th>
                    <th className="p-2">Marks Obtained</th>
                    <th className="p-2">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {(mockWeeklyExamResults || []).length > 0 ? (
                    mockWeeklyExamResults.map((r) => {
                      const stu = (mockStudents || []).find((s) => s.student_id === r.student_id);
                      return (
                        <tr key={r.weekly_exam_result_id}>
                          <td className="p-2 font-bold">{stu ? `${stu.first_name} ${stu.last_name}` : "Student"}</td>
                          <td className="p-2 font-bold text-[#2563EB]">{r.obtained_marks} / {viewResultsModal.total_marks}</td>
                          <td className="p-2 font-extrabold text-[#22C55E]">{r.grade}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-xs text-[#64748B]">
                        No weekly exam results evaluated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWeeklyTests;
