import React, { useState, useEffect } from "react";
import { 
  BookOpenCheck, Plus, CheckCircle2, FileText, X, Edit, Trash2, 
  Paperclip, Clock, AlertTriangle, Eye, RefreshCw
} from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";

const TeacherUploadAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  // Submissions Pop-up Modal State
  const [viewSubmissionsAssignment, setViewSubmissionsAssignment] = useState(null);
  const [modalTab, setModalTab] = useState("timely");
  const [viewFileModal, setViewFileModal] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Add / Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMarks, setNewMarks] = useState(50);
  const [refFileName, setRefFileName] = useState("");

  // Grade Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeMarks, setGradeMarks] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await teacherApi.getAssignments();
      const list = Array.isArray(data) ? data : [];
      setAssignments(list);
    } catch (err) {
      console.log("Error loading assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await teacherApi.getMyAssignedSubjects();
      const list = Array.isArray(data) ? data : [];
      setAssignedSubjects(list);
      if (list.length > 0) {
        setSelectedSubjectId(list[0].allocation_id || list[0].allocationId);
      }
    } catch (err) {
      console.log("Error loading subjects:", err);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadSubjects();
  }, []);

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
    setEditingAssignmentId(asgn.assignment_id || asgn.assignmentId);
    setNewTitle(asgn.title || "");
    setNewDesc(asgn.description || "");
    setNewDueDate(asgn.due_date || asgn.dueDate || "");
    setNewMarks(asgn.total_marks || asgn.totalMarks || 50);
    setRefFileName(asgn.attachment ? asgn.attachment.replace("/uploads/assignments/", "") : "");
    setShowAddModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment from PostgreSQL?")) {
      try {
        await teacherApi.deleteAssignment(id);
        setAssignments(assignments.filter((a) => (a.assignment_id || a.assignmentId) !== id));
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete assignment");
      }
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const attachmentPath = refFileName
        ? refFileName.startsWith("/")
          ? refFileName
          : `/uploads/assignments/${refFileName}`
        : null;

      const payload = {
        teacherSubjectId: selectedSubjectId,
        allocationId: selectedSubjectId,
        title: newTitle,
        description: newDesc,
        dueDate: newDueDate,
        totalMarks: Number(newMarks),
        attachment: attachmentPath,
        refFileName: refFileName
      };

      if (editingAssignmentId) {
        await teacherApi.updateAssignment(editingAssignmentId, payload);
      } else {
        await teacherApi.createAssignment(payload);
      }

      await loadAssignments();
      setShowAddModal(false);
      setEditingAssignmentId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save assignment to PostgreSQL");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSubmissionsModal = async (asgn, initialTab = "timely") => {
    setViewSubmissionsAssignment(asgn);
    setModalTab(initialTab);
    const asgnId = asgn.assignment_id || asgn.assignmentId;
    try {
      setLoadingSubmissions(true);
      const data = await teacherApi.getSubmissions(asgnId);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error loading submissions:", err);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSub) return;
    try {
      const subId = selectedSub.submission_id || selectedSub.submissionId;
      await teacherApi.gradeSubmission(subId, {
        obtainedMarks: Number(gradeMarks),
        feedback: gradeFeedback
      });
      
      setSubmissions(
        submissions.map((s) =>
          (s.submission_id || s.submissionId) === subId
            ? { ...s, obtained_marks: Number(gradeMarks), feedback: gradeFeedback, submission_status: "Graded" }
            : s
        )
      );
      setSelectedSub(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to grade submission");
    }
  };

  const modalSubmissions = viewSubmissionsAssignment
    ? submissions.filter(
        (s) =>
          ((modalTab === "timely" && (s.submission_status === "Timely" || s.submission_status === "Submitted" || s.submission_status === "Graded")) ||
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
          <p className="text-xs text-[#64748B] mt-0.5">Publish and manage coursework assignments in PostgreSQL database.</p>
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

        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2 bg-white rounded-xl border border-[#E2E8F0]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#14B8A6]" /> Loading assignments from PostgreSQL database...
          </div>
        ) : assignments && assignments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assignments.map((asgn) => {
              const aId = asgn.assignment_id || asgn.assignmentId;
              return (
                <div
                  key={aId}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                      <div className="space-y-1">
                        <h3 className="text-base font-extrabold text-[#1E293B] leading-snug">{asgn.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold">
                            Max Marks: {asgn.total_marks || asgn.totalMarks}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-mono font-semibold">
                            Due: {asgn.due_date || asgn.dueDate}
                          </span>
                          {asgn.subject_name && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-semibold">
                              {asgn.subject_name}
                            </span>
                          )}
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
                          onClick={() => handleDeleteAssignment(aId)}
                          className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">{asgn.description}</p>

                    {asgn.attachment && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-[#14B8A6] bg-[#14B8A6]/10 px-3 py-1 rounded-lg border border-[#14B8A6]/20">
                          <Paperclip className="w-3.5 h-3.5" /> Ref: {asgn.attachment}
                        </span>
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
                      View Student Submissions ({asgn.submissionCount || 0})
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
            No class assignments published yet. Click "Upload New Assignment" above to create one.
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
                <p className="text-xs text-[#64748B]">Student Submissions & Evaluation</p>
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
                <CheckCircle2 className="w-3.5 h-3.5" /> Submissions ({submissions.length})
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="p-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#14B8A6]" /> Fetching student submissions from database...
              </div>
            ) : modalSubmissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {modalSubmissions.map((sub) => (
                  <div key={sub.submission_id || sub.submissionId} className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#1E293B]">{sub.student_name}</h4>
                        <p className="text-[10px] text-[#64748B] font-mono">{sub.enrollment_no}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E]">
                        {sub.submission_status}
                      </span>
                    </div>

                    {sub.obtained_marks != null && (
                      <p className="text-xs text-[#2563EB] font-semibold">Marks: {sub.obtained_marks} / {viewSubmissionsAssignment.total_marks || viewSubmissionsAssignment.totalMarks}</p>
                    )}

                    {sub.feedback && (
                      <p className="text-[11px] text-[#64748B] italic bg-[#F8FAFC] p-2 rounded-lg">"{sub.feedback}"</p>
                    )}

                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedSub(sub);
                        setGradeMarks(sub.obtained_marks || 0);
                        setGradeFeedback(sub.feedback || "");
                      }} className="text-[10px] py-1">
                        Evaluate & Grade
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
                No student submissions found for this assignment.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B]">Evaluate Submission</h3>
              <button onClick={() => setSelectedSub(null)} className="p-1 rounded text-[#64748B]"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Obtained Marks</label>
                <input
                  type="number"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Faculty Feedback</label>
                <textarea
                  rows={2}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  placeholder="Feedback comments..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" onClick={() => setSelectedSub(null)}>Cancel</Button>
                <Button variant="accent" size="sm" onClick={handleGradeSubmission}>Save Grade</Button>
              </div>
            </div>
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
                <label className="block text-[#64748B] mb-1 font-medium">Assigned Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  {assignedSubjects && assignedSubjects.length > 0 ? (
                    assignedSubjects.map((s) => (
                      <option key={s.allocation_id || s.subject_id} value={s.allocation_id || s.subject_id}>
                        {s.subject_name || s.subjectName} ({s.subject_code || s.subjectCode})
                      </option>
                    ))
                  ) : (
                    <option value="">No Assigned Subjects</option>
                  )}
                </select>
              </div>

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

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Reference File Name (Optional)</label>
                <input
                  type="text"
                  value={refFileName}
                  onChange={(e) => setRefFileName(e.target.value)}
                  placeholder="e.g. React_Assignment_Guide.pdf"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingAssignmentId ? "Save Changes" : "Publish Assignment"}
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
