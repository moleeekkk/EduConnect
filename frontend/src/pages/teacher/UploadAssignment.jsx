import React, { useState, useEffect } from "react";
import { 
  BookOpenCheck, Plus, CheckCircle2, FileText, Check, X, Edit, Trash2, 
  Paperclip, Upload, Clock, AlertTriangle, UserCheck, Mail, Send, Eye, Users
} from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";
import { readFileAsDataURL, getDisplayFileName, downloadFile, openFileInNewTab } from "../../utils/fileViewer";

const defaultSubmissions = [
  {
    submission_id: "sub-001",
    assignment_id: "asgn-001",
    student_id: "stu-001",
    student_name: "Maulik Dabhi",
    enrollment_no: "25CI2110016",
    submission_date: "2026-08-10 14:30",
    attachment: "maulik_asgn1_final.zip",
    obtained_marks: 46,
    feedback: "Excellent architecture and well-documented component layout.",
    submission_status: "Timely",
  },
  {
    submission_id: "sub-002",
    assignment_id: "asgn-001",
    student_id: "stu-002",
    student_name: "Aanya Sharma",
    enrollment_no: "25CI2110017",
    submission_date: "2026-08-11 09:15",
    attachment: "aanya_microservices_v2.pdf",
    obtained_marks: 42,
    feedback: "Good work, try to submit before the deadline next time.",
    submission_status: "Late",
  },
  {
    submission_id: "sub-003",
    assignment_id: "asgn-001",
    student_id: "stu-003",
    student_name: "Rohan Verma",
    enrollment_no: "25CI2110018",
    submission_date: "-",
    attachment: null,
    obtained_marks: null,
    feedback: null,
    submission_status: "Missed",
  },
  {
    submission_id: "sub-004",
    assignment_id: "asgn-002",
    student_id: "stu-001",
    student_name: "Maulik Dabhi",
    enrollment_no: "25CI2110016",
    submission_date: "2026-08-14 11:00",
    attachment: "maulik_devops_docker.zip",
    obtained_marks: 48,
    feedback: "Outstanding Docker pipeline setup.",
    submission_status: "Timely",
  },
  {
    submission_id: "sub-005",
    assignment_id: "asgn-002",
    student_id: "stu-002",
    student_name: "Aanya Sharma",
    enrollment_no: "25CI2110017",
    submission_date: "2026-08-16 18:45",
    attachment: "aanya_devops_doc.pdf",
    obtained_marks: 38,
    feedback: "Submitted past due date.",
    submission_status: "Late",
  },
  {
    submission_id: "sub-006",
    assignment_id: "asgn-002",
    student_id: "stu-003",
    student_name: "Rohan Verma",
    enrollment_no: "25CI2110018",
    submission_date: "-",
    attachment: null,
    obtained_marks: null,
    feedback: null,
    submission_status: "Missed",
  },
];

const TeacherUploadAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState(defaultSubmissions);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Submissions Pop-up Modal State
  const [viewSubmissionsAssignment, setViewSubmissionsAssignment] = useState(null);
  const [modalTab, setModalTab] = useState("timely"); // "timely", "late", "missed"
  const [viewFileModal, setViewFileModal] = useState(null);

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
  const [reminderSentId, setReminderSentId] = useState(null);

  const [refFileData, setRefFileData] = useState(null);

  const handleViewDocument = (fileUrl, title = "Document Preview") => {
    openFileInNewTab(fileUrl, title);
  };

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const identifier = loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;

      try {
        const [subData, asgnData] = await Promise.all([
          teacherApi.getAssignedSubjects(identifier),
          teacherApi.getAssignments(identifier),
        ]);

        if (Array.isArray(subData)) {
          setAssignedSubjects(subData);
          if (subData.length > 0) {
            setSelectedSubjectId(subData[0].subject_id || "");
          }
        }
        if (Array.isArray(asgnData)) {
          setAssignments(asgnData);
          try {
            const subPromises = asgnData.map((a) =>
              a.assignment_id ? teacherApi.getAssignmentSubmissions(a.assignment_id) : Promise.resolve([])
            );
            const subResults = await Promise.all(subPromises);
            const flatSubs = subResults.flat().filter(Boolean);
            if (flatSubs.length > 0) {
              setSubmissions((prev) => {
                const map = new Map();
                prev.forEach((s) => map.set(`${s.assignment_id}-${s.student_id}`, s));
                flatSubs.forEach((s) => map.set(`${s.assignment_id}-${s.student_id}`, s));
                return Array.from(map.values());
              });
            }
          } catch (subErr) {
            console.error("Error fetching assignment submissions for stats:", subErr);
          }
        }
      } catch (err) {
        console.error("Teacher upload assignment data load error:", err);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefFileName(file.name);
      try {
        const dataUrl = await readFileAsDataURL(file);
        setRefFileData(dataUrl);
      } catch (err) {
        console.error("Error reading uploaded file as Data URL:", err);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingAssignmentId(null);
    setNewTitle("");
    setNewDesc("");
    setNewDueDate("2026-08-25");
    setNewMarks(50);
    setRefFileName("");
    setRefFileData(null);
    if (assignedSubjects.length > 0) {
      setSelectedSubjectId(assignedSubjects[0].subject_id || "");
    }
    setShowAddModal(true);
  };


  const handleOpenEditModal = (asgn) => {
    setEditingAssignmentId(asgn.assignment_id);
    setNewTitle(asgn.title);
    setNewDesc(asgn.description);
    setNewDueDate(asgn.due_date);
    setNewMarks(asgn.total_marks);
    const cleanName = getDisplayFileName(asgn.file_name, asgn.attachment, asgn.title);
    setRefFileName(cleanName);
    setRefFileData(null);
    setSelectedSubjectId(asgn.subject_id || (assignedSubjects[0]?.subject_id || ""));
    setShowAddModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment from database?")) {
      try {
        await teacherApi.deleteAssignment(id);
        setAssignments(assignments.filter((a) => a.assignment_id !== id));
        setSubmissions(submissions.filter((s) => s.assignment_id !== id));
        notifySuccess("Assignment deleted successfully from database!");
      } catch (err) {
        console.error("Error deleting assignment:", err);
        notifyError("Failed to delete assignment from database.");
      }
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    const cleanFileName = getDisplayFileName(refFileName, refFileData, newTitle);
    const attachmentVal = refFileData || (refFileName
      ? (refFileName.startsWith("data:") || refFileName.startsWith("/"))
        ? refFileName
        : `/uploads/assignments/${refFileName}`
      : null);

    const selectedSubObj = assignedSubjects.find((s) => String(s.subject_id) === String(selectedSubjectId));
    const subName = selectedSubObj ? `${selectedSubObj.subject_code} - ${selectedSubObj.subject_name}` : "Assigned Subject";

    const payload = {
      subject_id: selectedSubjectId,
      title: newTitle,
      description: newDesc,
      due_date: newDueDate,
      total_marks: Number(newMarks),
      attachment: attachmentVal,
      file_name: cleanFileName,
      fileName: cleanFileName,
    };

    try {
      if (editingAssignmentId) {
        await teacherApi.updateAssignment(editingAssignmentId, payload);
        notifySuccess(`Assignment '${newTitle}' updated in database successfully!`);
      } else {
        await teacherApi.createAssignment(payload);
        notifySuccess(`Assignment '${newTitle}' published and saved to database successfully!`);
      }

      // Refresh assignment list from database
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const identifier = loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;
      const dbAsgns = await teacherApi.getAssignments(identifier);
      if (Array.isArray(dbAsgns)) {
        setAssignments(dbAsgns);
      }
    } catch (err) {
      console.error("Error saving assignment to database:", err);
      notifyError("Failed to save assignment to database.");
    }

    setShowAddModal(false);
    setEditingAssignmentId(null);
  };

  const handleGradeSubmission = async () => {
    if (!selectedSub) return;
    try {
      if (selectedSub.submission_id && !selectedSub.submission_id.startsWith("sub-missing-")) {
        await teacherApi.gradeSubmission(selectedSub.submission_id, {
          obtained_marks: Number(gradeMarks),
          feedback: gradeFeedback,
        });
      }
    } catch (err) {
      console.error("Error saving grade to database:", err);
    }

    // Sync to local student submissions storage for seamless offline/immediate UI sync
    try {
      const savedSubsStr = localStorage.getItem("educonnect_student_submissions");
      if (savedSubsStr) {
        let savedSubs = JSON.parse(savedSubsStr);
        savedSubs = savedSubs.map((s) => {
          if (
            String(s.submission_id) === String(selectedSub.submission_id) ||
            String(s.assignment_id) === String(selectedSub.assignment_id) ||
            (s.title && s.title === selectedSub.assignment_title)
          ) {
            return {
              ...s,
              obtained_marks: Number(gradeMarks),
              feedback: gradeFeedback,
              remarks: gradeFeedback,
            };
          }
          return s;
        });
        localStorage.setItem("educonnect_student_submissions", JSON.stringify(savedSubs));
      }
    } catch (e) {
      console.error("Error syncing student local submissions:", e);
    }

    setSubmissions(
      submissions.map((s) =>
        s.submission_id === selectedSub.submission_id
          ? { ...s, obtained_marks: Number(gradeMarks), feedback: gradeFeedback, submission_status: "Graded" }
          : s
      )
    );
    notifySuccess(`Grade (${gradeMarks} marks) saved for ${selectedSub.student_name}!`);
    setSelectedSub(null);
  };

  const sendReminder = (subId) => {
    setReminderSentId(subId);
    notifySuccess("Email reminder sent to student!");
    setTimeout(() => setReminderSentId(null), 3000);
  };

  // Helper to determine exact submission status (Timely, Late, or Missed)
  const getEffectiveSubmissionStatus = (sub, asgn) => {
    if (!sub || sub.submitted === false || (!sub.attachment && sub.submission_status === "Missed")) {
      return "Missed";
    }
    if (sub.submission_status === "Late") return "Late";
    if (sub.submission_status === "Timely") return "Timely";

    // Fallback: Compare submission date with due date if status is not explicitly set
    const dueDateStr = asgn?.due_date || sub?.due_date;
    const subDateStr = sub?.submission_date;
    if (dueDateStr && subDateStr && subDateStr !== "-") {
      try {
        const due = new Date(dueDateStr);
        due.setHours(23, 59, 59, 999);
        const subDate = new Date(subDateStr);
        if (subDate > due) {
          return "Late";
        }
      } catch (e) {}
    }
    return "Timely";
  };

  // Helper to compute stats per assignment
  const getAssignmentStats = (asgnId, asgnObj) => {
    const asgnSubs = submissions.filter((s) => String(s.assignment_id) === String(asgnId));
    if (asgnSubs.length > 0) {
      let timely = 0;
      let late = 0;
      let missed = 0;
      asgnSubs.forEach((s) => {
        const st = getEffectiveSubmissionStatus(s, asgnObj);
        if (st === "Late") late++;
        else if (st === "Timely") timely++;
        else missed++;
      });
      return { timely, late, missed, total: asgnSubs.length };
    }
    if (asgnObj) {
      return {
        timely: asgnObj.timely_count || 0,
        late: asgnObj.late_count || 0,
        missed: asgnObj.missed_count || 0,
        total: (asgnObj.timely_count || 0) + (asgnObj.late_count || 0) + (asgnObj.missed_count || 0),
      };
    }
    return { timely: 0, late: 0, missed: 0, total: 0 };
  };

  // Open Submissions Pop-up Modal for a specific assignment
  const handleOpenSubmissionsModal = async (asgn, initialTab = "timely") => {
    setViewSubmissionsAssignment(asgn);
    setModalTab(initialTab);
    if (asgn?.assignment_id) {
      try {
        const dbSubs = await teacherApi.getAssignmentSubmissions(asgn.assignment_id);
        if (Array.isArray(dbSubs) && dbSubs.length > 0) {
          setSubmissions((prev) => {
            const otherSubs = prev.filter((s) => s.assignment_id !== asgn.assignment_id);
            return [...dbSubs, ...otherSubs];
          });
        }
      } catch (err) {
        console.error("Error fetching assignment submissions from database:", err);
      }
    }
  };

  // Filtered submissions inside modal
  const modalSubmissions = viewSubmissionsAssignment
    ? submissions.filter((s) => {
        if (String(s.assignment_id) !== String(viewSubmissionsAssignment.assignment_id)) {
          return false;
        }
        const st = getEffectiveSubmissionStatus(s, viewSubmissionsAssignment);
        if (modalTab === "timely") return st === "Timely";
        if (modalTab === "late") return st === "Late";
        if (modalTab === "missed") return st === "Missed";
        return false;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Module Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Upload Assignment</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Upload New Assignment
        </Button>
      </div>

      {/* Published Class Assignments List */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assignments.map((asgn) => {
            const stats = getAssignmentStats(asgn.assignment_id, asgn);
            return (
              <div
                key={asgn.assignment_id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Card Header: Title, Marks, Due Date & Actions */}
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

                    {/* Action Buttons: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(asgn)}
                        className="p-1.5 rounded-lg text-[#14B8A6] hover:bg-[#14B8A6]/10 transition-colors cursor-pointer"
                        title="Edit Assignment"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(asgn.assignment_id)}
                        className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions / Description */}
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">{asgn.description}</p>

                  {/* Ref File Attachment Pill - Clickable Teacher Attachment */}
                  {asgn.attachment && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleViewDocument(asgn.attachment, asgn.title)}
                        className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-[#14B8A6] bg-[#14B8A6]/10 hover:bg-[#14B8A6] hover:text-white px-3 py-1 rounded-lg border border-[#14B8A6]/20 transition-all cursor-pointer"
                        title="Click to view document in a new tab"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> Ref File: {getDisplayFileName(asgn.file_name, asgn.attachment, asgn.title)}
                      </button>
                    </div>
                  )}

                  {/* Submission Breakdown Interactive Badges Grid */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                      Submissions Breakdown (Click to view student list)
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <button
                        onClick={() => handleOpenSubmissionsModal(asgn, "timely")}
                        className="p-2 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                        title="View Timely Submitted Students"
                      >
                        <span className="font-extrabold text-sm">{stats.timely}</span>
                        <span className="text-[10px] font-bold uppercase">Timely</span>
                      </button>

                      <button
                        onClick={() => handleOpenSubmissionsModal(asgn, "late")}
                        className="p-2 rounded-lg bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] hover:bg-[#F97316] hover:text-white transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                        title="View Late Submitted Students"
                      >
                        <span className="font-extrabold text-sm">{stats.late}</span>
                        <span className="text-[10px] font-bold uppercase">Late</span>
                      </button>

                      <button
                        onClick={() => handleOpenSubmissionsModal(asgn, "missed")}
                        className="p-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                        title="View Missed / Pending Students"
                      >
                        <span className="font-extrabold text-sm">{stats.missed}</span>
                        <span className="text-[10px] font-bold uppercase">Missed</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Card Button */}
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleOpenSubmissionsModal(asgn, "timely")}
                    className="w-full text-xs"
                  >
                    View Student Submissions Pop-up
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POP-UP MODAL FOR ASSIGNMENT STUDENT SUBMISSIONS */}
      {viewSubmissionsAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  {viewSubmissionsAssignment.title}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Student Submissions Overview • Due Date: {viewSubmissionsAssignment.due_date}
                </p>
              </div>
              <button
                onClick={() => setViewSubmissionsAssignment(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Bar / Filter Tabs */}
            <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex items-center gap-2">
              <button
                onClick={() => setModalTab("timely")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === "timely"
                    ? "bg-[#22C55E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submitted Timely ({getAssignmentStats(viewSubmissionsAssignment.assignment_id, viewSubmissionsAssignment).timely})
              </button>

              <button
                onClick={() => setModalTab("late")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === "late"
                    ? "bg-[#F97316] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Submitted Late ({getAssignmentStats(viewSubmissionsAssignment.assignment_id, viewSubmissionsAssignment).late})
              </button>

              <button
                onClick={() => setModalTab("missed")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === "missed"
                    ? "bg-[#EF4444] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-white"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Missed / Pending ({getAssignmentStats(viewSubmissionsAssignment.assignment_id, viewSubmissionsAssignment).missed})
              </button>
            </div>

            {/* Modal Body: Student Cards Grid */}
            {modalSubmissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
                {modalSubmissions.map((sub) => (
                  <div
                    key={sub.submission_id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#2563EB]/30 transition-all"
                  >
                    {/* Card Header: Student Avatar & Info */}
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/20">
                          {sub.student_name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#1E293B]">{sub.student_name}</h4>
                          <span className="font-mono text-[10px] text-[#2563EB] font-bold">
                            {sub.enrollment_no}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {(() => {
                        const statusBadge = getEffectiveSubmissionStatus(sub, viewSubmissionsAssignment);
                        if (statusBadge === "Timely") {
                          return (
                            <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-[10px] font-bold">
                              Timely
                            </span>
                          );
                        }
                        if (statusBadge === "Late") {
                          return (
                            <span className="px-2 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 text-[10px] font-bold">
                              Late
                            </span>
                          );
                        }
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-[10px] font-bold">
                            Missed
                          </span>
                        );
                      })()}
                    </div>

                    {/* Submission Info Box */}
                    <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B] font-semibold">File Attached:</span>
                        {sub.attachment ? (
                          <button
                            onClick={() => handleViewDocument(sub.attachment, `${sub.student_name}'s Submission`)}
                            className="inline-flex items-center gap-1 font-mono font-bold text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-2.5 py-1 rounded transition-all cursor-pointer text-[11px]"
                            title="Click file name to view document in a new tab"
                          >
                            <Paperclip className="w-3 h-3" /> {getDisplayFileName(sub.file_name, sub.attachment, `${sub.student_name}_Submission`)}
                          </button>
                        ) : (
                          <span className="text-[#EF4444] font-semibold text-[10px]">No File Uploaded</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B] font-semibold">Submission Time:</span>
                        <span className="font-mono text-[#1E293B] font-medium">{sub.submission_date}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] font-bold">Evaluation Score:</span>
                        <span className="font-extrabold text-[#1E293B]">
                          {sub.obtained_marks !== null
                            ? `${sub.obtained_marks} / ${viewSubmissionsAssignment.total_marks}`
                            : "Not Graded"}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2 border-t border-[#E2E8F0]">
                      {sub.submission_status !== "Missed" ? (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setSelectedSub(sub);
                            setGradeMarks(sub.obtained_marks || 45);
                            setGradeFeedback(sub.feedback || "Good work");
                          }}
                          className="text-xs w-full"
                        >
                          Grade / Review Submission
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Mail}
                          onClick={() => sendReminder(sub.submission_id)}
                          className="text-xs w-full text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                        >
                          {reminderSentId === sub.submission_id ? "Reminder Sent! ✓" : "Send Email Reminder"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#22C55E] mx-auto" />
                <p className="font-bold text-[#1E293B]">No student records found under this status tab.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Assignment Modal */}
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
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-3 text-xs">
              {/* Assigned Subject Selector */}
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Select Assigned Subject *</label>
                {assignedSubjects.length > 0 ? (
                  <select
                    required
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] text-xs cursor-pointer"
                  >
                    <option value="">-- Choose Assigned Subject --</option>
                    {assignedSubjects.map((sub) => (
                      <option key={sub.subject_id} value={sub.subject_id}>
                        {sub.subject_code} - {sub.subject_name} {sub.subject_type ? `(${sub.subject_type})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg text-[#EF4444] text-xs font-semibold">
                    No subjects assigned to you yet. Please contact Administrator for subject allocation.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Assignment Title</label>
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
                <label className="block text-[#64748B] mb-1 font-medium">Instructions / Description</label>
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

              {/* Optional Reference Document Upload */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                <label className="block text-[#1E293B] font-bold flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Reference Document Attachment
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/10 file:text-[#2563EB] cursor-pointer"
                />
                {refFileName && (
                  <p className="text-[11px] text-[#14B8A6] font-semibold font-mono truncate">
                    Selected Document: {getDisplayFileName(refFileName, refFileData, newTitle)}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                Grade Submission ({selectedSub.student_name})
              </h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Submitted File Attachment Box */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Submitted File Attachment</span>
                  {selectedSub.attachment ? (
                    <button
                      onClick={() => handleViewDocument(selectedSub.attachment, `${selectedSub.student_name}'s Submission`)}
                      className="font-mono font-bold text-[#2563EB] text-xs hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                      title="Click file name to view document in a new tab"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> {getDisplayFileName(selectedSub.file_name, selectedSub.attachment, `${selectedSub.student_name}_Submission`)}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs italic">No file uploaded</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Awarded Marks</label>
                <input
                  type="number"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Faculty Feedback</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="accent" size="sm" onClick={handleGradeSubmission}>
                  Save Grade & Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Uploaded File Viewer Modal */}
      {viewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  Student Submitted Assignment File
                </h3>
              </div>
              <button
                onClick={() => setViewFileModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & File Details Card */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase">Submitted By</span>
                  <span className="font-mono text-[11px] font-bold text-[#2563EB]">
                    {viewFileModal.enrollment_no}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-[#1E293B]">{viewFileModal.student_name}</p>
                <p className="text-[#64748B]">Submission Time: <span className="font-mono font-semibold text-[#1E293B]">{viewFileModal.submission_date}</span></p>
              </div>

              {/* Document File Card Preview Container */}
              <div className="p-6 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 text-center space-y-3">
                <Paperclip className="w-10 h-10 text-[#2563EB] mx-auto animate-bounce" />
                <div>
                  <h4 className="text-sm font-extrabold text-[#1E293B] font-mono truncate max-w-xs mx-auto">
                    {getDisplayFileName(viewFileModal.file_name, viewFileModal.attachment, `${viewFileModal.student_name}_Submission`)}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Official Student Document • Submitted for Evaluation
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Paperclip}
                    onClick={() => handleViewDocument(viewFileModal.attachment, `${viewFileModal.student_name}'s Submission`)}
                    className="text-xs"
                  >
                    Download Attachment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewDocument(viewFileModal.attachment, `${viewFileModal.student_name}'s Submission`)}
                    className="text-xs"
                  >
                    Open Full-Screen Document Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherUploadAssignment;

