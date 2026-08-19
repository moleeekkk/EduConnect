import React, { useState } from "react";
import { 
  BookOpenCheck, Plus, CheckCircle2, FileText, X, Edit, Trash2, 
  Paperclip, Clock, AlertTriangle, Mail, Eye
} from "lucide-react";
import Button from "../../components/common/Button";
import { mockAssignments } from "../../data/mockData";

const TeacherUploadAssignment = () => {
  const [assignments, setAssignments] = useState(mockAssignments || []);
  const [submissions, setSubmissions] = useState([]);

  // Submissions Pop-up Modal State
  const [viewSubmissionsAssignment, setViewSubmissionsAssignment] = useState(null);
  const [modalTab, setModalTab] = useState("timely");
  const [viewFileModal, setViewFileModal] = useState(null);

  // Add / Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMarks, setNewMarks] = useState(50);
  const [refFileName, setRefFileName] = useState("");

  // Grade Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeMarks, setGradeMarks] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [reminderSentId, setReminderSentId] = useState(null);

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
    setNewDueDate("");
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
      setSubmissions(submissions.filter((s) => s.assignment_id !== id));
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
      const newAsgnId = `asgn-${Date.now()}`;
      const created = {
        assignment_id: newAsgnId,
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

  const handleGradeSubmission = () => {
    if (!selectedSub) return;
    setSubmissions(
      submissions.map((s) =>
        s.submission_id === selectedSub.submission_id
          ? { ...s, obtained_marks: Number(gradeMarks), feedback: gradeFeedback }
          : s
      )
    );
    setSelectedSub(null);
  };

  const sendReminder = (subId) => {
    setReminderSentId(subId);
    setTimeout(() => setReminderSentId(null), 3000);
  };

  const getAssignmentStats = (asgnId) => {
    const asgnSubs = submissions.filter((s) => s.assignment_id === asgnId);
    const timely = asgnSubs.filter((s) => s.submission_status === "Timely").length;
    const late = asgnSubs.filter((s) => s.submission_status === "Late").length;
    const missed = asgnSubs.filter((s) => s.submission_status === "Missed").length;
    return { timely, late, missed, total: asgnSubs.length };
  };

  const handleOpenSubmissionsModal = (asgn, initialTab = "timely") => {
    setViewSubmissionsAssignment(asgn);
    setModalTab(initialTab);
  };

  const modalSubmissions = viewSubmissionsAssignment
    ? submissions.filter(
        (s) =>
          s.assignment_id === viewSubmissionsAssignment.assignment_id &&
          ((modalTab === "timely" && s.submission_status === "Timely") ||
            (modalTab === "late" && s.submission_status === "Late") ||
            (modalTab === "missed" && s.submission_status === "Missed"))
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Upload Assignment</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Upload New Assignment
        </Button>
      </div>

      {/* Published Assignments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#1E293B]">Published Class Assignments</h2>
          </div>
          <span className="text-xs text-[#64748B] font-mono bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-lg font-bold">
            Total Assignments: {assignments.length}
          </span>
        </div>

        {assignments && assignments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assignments.map((asgn) => {
              const stats = getAssignmentStats(asgn.assignment_id);
              return (
                <div
                  key={asgn.assignment_id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                      <div className="space-y-1">
                        <h3 className="text-base font-extrabold text-[#1E293B] leading-snug">{asgn.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold">
                            Max Marks: {asgn.total_marks}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-mono font-semibold">
                            Due: {asgn.due_date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(asgn)}
                          className="p-1.5 rounded-lg text-[#14B8A6] hover:bg-[#14B8A6]/10 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(asgn.assignment_id)}
                          className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">{asgn.description}</p>

                    {asgn.attachment && (
                      <div className="pt-1">
                        <button
                          onClick={() =>
                            setViewFileModal({
                              attachment: asgn.attachment,
                              student_name: "Faculty Published Reference File",
                            })
                          }
                          className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-[#14B8A6] bg-[#14B8A6]/10 hover:bg-[#14B8A6] hover:text-white px-3 py-1 rounded-lg border border-[#14B8A6]/20 transition-all cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5" /> Ref File: {asgn.attachment}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0]">
                    <Button
                      variant="accent"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleOpenSubmissionsModal(asgn, "timely")}
                      className="w-full text-xs"
                    >
                      View Student Submissions
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
            No class assignments published yet.
          </div>
        )}
      </div>

      {/* Submissions Modal */}
      {viewSubmissionsAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  {viewSubmissionsAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setViewSubmissionsAssignment(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex items-center gap-2">
              <button
                onClick={() => setModalTab("timely")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === "timely" ? "bg-[#22C55E] text-white" : "text-[#64748B]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Timely
              </button>
              <button
                onClick={() => setModalTab("late")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === "late" ? "bg-[#F97316] text-white" : "text-[#64748B]"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Late
              </button>
              <button
                onClick={() => setModalTab("missed")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === "missed" ? "bg-[#EF4444] text-white" : "text-[#64748B]"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Missed
              </button>
            </div>

            {modalSubmissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {modalSubmissions.map((sub) => (
                  <div key={sub.submission_id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
                    <h4 className="text-xs font-extrabold text-[#1E293B]">{sub.student_name}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
                No student submissions under this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editingAssignmentId ? "Edit Assignment Details" : "Upload New Assignment"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Assignment title..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Instructions / Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Instructions..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={newMarks}
                    onChange={(e) => setNewMarks(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
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
    </div>
  );
};

export default TeacherUploadAssignment;
