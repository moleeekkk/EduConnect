import React, { useState } from "react";
import { BookOpenCheck, Plus, CheckCircle2, FileText, Check, X, Edit, Trash2, Paperclip, Upload } from "lucide-react";
import Button from "../../components/common/Button";
import { mockAssignments, mockAssignmentSubmissions, mockStudents } from "../../data/mockData";

const TeacherUploadAssignment = () => {
  const [assignments, setAssignments] = useState(mockAssignments);
  const [submissions, setSubmissions] = useState(mockAssignmentSubmissions);

  // Add / Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("2026-08-25");
  const [newMarks, setNewMarks] = useState(50);
  const [refFileName, setRefFileName] = useState("");

  // Grade Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeMarks, setGradeMarks] = useState(45);
  const [gradeFeedback, setGradeFeedback] = useState("Good work");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefFileName(file.name);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAssignmentId(null);
    setNewTitle("");
    setNewDesc("");
    setNewDueDate("2026-08-25");
    setNewMarks(50);
    setRefFileName("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (asgn) => {
    setEditingAssignmentId(asgn.assignment_id);
    setNewTitle(asgn.title);
    setNewDesc(asgn.description);
    setNewDueDate(asgn.due_date);
    setNewMarks(asgn.total_marks);
    setRefFileName(asgn.attachment ? asgn.attachment.replace("/uploads/assignments/", "") : "");
    setShowAddModal(true);
  };

  const handleDeleteAssignment = (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      setAssignments(assignments.filter((a) => a.assignment_id !== id));
    }
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    const attachmentPath = refFileName
      ? refFileName.startsWith("/")
        ? refFileName
        : `/uploads/assignments/${refFileName}`
      : null;

    if (editingAssignmentId) {
      // Update Existing Assignment
      setAssignments(
        assignments.map((a) =>
          a.assignment_id === editingAssignmentId
            ? {
                ...a,
                title: newTitle,
                description: newDesc,
                due_date: newDueDate,
                total_marks: Number(newMarks),
                attachment: attachmentPath,
                updated_at: new Date().toISOString(),
              }
            : a
        )
      );
    } else {
      // Create New Assignment
      const created = {
        assignment_id: `asgn-00${assignments.length + 1}`,
        teacher_subject_id: "ts-001",
        title: newTitle,
        description: newDesc,
        due_date: newDueDate,
        total_marks: Number(newMarks),
        attachment: attachmentPath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAssignments([created, ...assignments]);
    }

    setShowAddModal(false);
    setEditingAssignmentId(null);
  };

  const handleGradeSubmission = (status) => {
    if (!selectedSub) return;
    setSubmissions(
      submissions.map((s) =>
        s.submission_id === selectedSub.submission_id
          ? { ...s, obtained_marks: Number(gradeMarks), feedback: gradeFeedback, submission_status: status }
          : s
      )
    );
    setSelectedSub(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Assignments & Student Submissions (assignments)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Upload new assignments, edit or delete existing entries, and grade student submissions</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Upload New Assignment
        </Button>
      </div>

      {/* Published Class Assignments List */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Published Class Assignments</h2>
          <span className="text-xs text-[#64748B] font-mono">Total: {assignments.length}</span>
        </div>
        <div className="divide-y divide-[#E2E8F0] text-xs">
          {assignments.map((asgn) => (
            <div key={asgn.assignment_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1E293B] text-sm">{asgn.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[10px]">
                    Total Marks: {asgn.total_marks}
                  </span>
                </div>
                <p className="text-[#64748B]">{asgn.description}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                  <span className="text-[#64748B] font-mono">Due Date: {asgn.due_date}</span>
                  {asgn.attachment ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded">
                      <Paperclip className="w-3 h-3" /> Ref File: {asgn.attachment}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">No reference doc attached</span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => handleOpenEditModal(asgn)}
                  className="text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDeleteAssignment(asgn.assignment_id)}
                  className="text-xs !bg-[#EF4444]/10 !text-[#EF4444] hover:!bg-[#EF4444] hover:!text-white border-transparent"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Uploaded Submissions Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#1E293B]">Student Uploaded Submissions (assignment_submissions)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Submission Date (submission_date)</th>
                <th className="p-3.5">Uploaded File (attachment)</th>
                <th className="p-3.5">Status (submission_status)</th>
                <th className="p-3.5">Obtained Marks</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {submissions.map((sub) => {
                const stu = mockStudents.find((s) => s.student_id === sub.student_id);
                return (
                  <tr key={sub.submission_id} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-semibold">{stu ? `${stu.first_name} ${stu.last_name}` : "Student"}</td>
                    <td className="p-3.5 font-mono">{sub.submission_date}</td>
                    <td className="p-3.5 font-mono text-[#2563EB]">{sub.attachment}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold">
                        {sub.submission_status}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold">
                      {sub.obtained_marks !== null ? sub.obtained_marks : "Not Graded"}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSub(sub);
                          setGradeMarks(sub.obtained_marks || 40);
                          setGradeFeedback(sub.feedback || "Good work");
                        }}
                        className="text-xs"
                      >
                        Grade / Review
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editingAssignmentId ? "Edit Assignment Details" : "Upload New Assignment (assignments)"}
            </h3>

            <form onSubmit={handleSaveAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Title (title)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Assignment 3: Cloud Microservices"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Instructions / Description (description)</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Enter detailed assignment instructions..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Due Date (due_date)</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Total Marks (total_marks)</label>
                  <input
                    type="number"
                    required
                    value={newMarks}
                    onChange={(e) => setNewMarks(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              {/* Optional Reference Document Upload */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                <label className="block text-[#1E293B] font-bold flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Optional Reference Document (attachment)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/10 file:text-[#2563EB] cursor-pointer"
                />
                {refFileName && (
                  <p className="text-[11px] text-[#14B8A6] font-semibold font-mono">
                    Selected Document: {refFileName}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  {editingAssignmentId ? "Save Changes" : "Publish Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Grade Submission & Feedback
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1">Awarded Marks (obtained_marks)</label>
                <input
                  type="number"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1">Faculty Feedback (feedback)</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" onClick={() => handleGradeSubmission("Submitted")}>
                  Accept Submission
                </Button>
                <Button variant="accent" size="sm" onClick={() => handleGradeSubmission("Submitted")}>
                  Save Grade
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherUploadAssignment;
