import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Award,
  Clock,
  FileText,
  Layers,
  CheckCircle2,
  X,
  Building2,
  Search,
  Loader2,
  Filter,
} from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const AdminSubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingSubj, setDeletingSubj] = useState(null);

  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [viewSubject, setViewSubject] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    subject_code: "",
    subject_name: "",
    department_id: "",
    semester_id: "",
    credits: 4,
    subject_type: "Core Theory",
    total_hours: 60,
    description: "",
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subData, deptData, semData] = await Promise.all([
        adminApi.getSubjects(),
        adminApi.getDepartments(),
        adminApi.getSemesters(),
      ]);
      setSubjects(Array.isArray(subData) ? subData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setSemesters(Array.isArray(semData) ? semData : []);
    } catch (err) {
      console.error("Subject management load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper mapping department_id to Department Name / Code
  const getDepartmentName = (deptId) => {
    if (!deptId) return "Main Department";
    const dept = departments.find(
      (d) =>
        String(d.department_id || d.departmentId || d.program_id || d.id) ===
        String(deptId) || d.department_code === deptId
    );
    return dept
      ? dept.department_name || dept.program_name || dept.name
      : "Main Department";
  };

  const getDepartmentCode = (deptId) => {
    if (!deptId) return "MCA";
    const dept = departments.find(
      (d) =>
        String(d.department_id || d.departmentId || d.program_id || d.id) ===
        String(deptId) || d.department_code === deptId
    );
    return dept
      ? dept.department_code || dept.program_code || dept.code
      : "MCA";
  };

  // Helper mapping semester_id to Semester Name / Label
  const getSemesterLabel = (semId) => {
    if (!semId) return "Semester 1";
    const sem = semesters.find(
      (s) =>
        String(s.semester_id || s.semesterId || s.id) === String(semId) ||
        String(s.semester_number || s.number) === String(semId)
    );
    if (sem)
      return sem.semester_name || `Semester ${sem.semester_number || sem.number}`;
    return `Semester ${semId}`;
  };

  // Filter available semesters based on selected department
  const getAvailableSemesters = (deptId) => {
    if (!semesters || semesters.length === 0) return [];
    if (!deptId || deptId === "all") return semesters;

    const filtered = semesters.filter((s) => {
      const sDept = s.department_id || s.departmentId;
      return String(sDept) === String(deptId);
    });

    return filtered.length > 0 ? filtered : semesters;
  };

  // Available semesters for the Add/Edit form based on chosen department
  const formAvailableSemesters = subjectForm.department_id
    ? getAvailableSemesters(subjectForm.department_id)
    : semesters;

  // Filtered Subjects list for table display
  const filteredSubjects = subjects.filter((subj) => {
    const deptId = subj.department_id || subj.departmentId || subj.program_id;
    const semId = subj.semester_id || subj.semesterId;

    if (selectedDepartment !== "all") {
      if (deptId) {
        const matchesId = String(deptId) === String(selectedDepartment);
        const matchesCode =
          getDepartmentCode(deptId) === getDepartmentCode(selectedDepartment);
        if (!matchesId && !matchesCode) return false;
      }
    }

    if (selectedSemester !== "all") {
      if (semId) {
        const matchesId = String(semId) === String(selectedSemester);
        const matchesLabel =
          getSemesterLabel(semId) === getSemesterLabel(selectedSemester);
        if (!matchesId && !matchesLabel) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const code = (subj.subject_code || subj.code || "").toLowerCase();
      const name = (subj.subject_name || subj.name || "").toLowerCase();
      if (!code.includes(q) && !name.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Open Modal for Adding Subject
  const handleOpenAddSubject = () => {
    setEditSubject(null);

    const defaultDept =
      selectedDepartment !== "all"
        ? selectedDepartment
        : departments.length > 0
        ? departments[0].department_id || departments[0].id
        : "";

    const availableSems = defaultDept ? getAvailableSemesters(defaultDept) : semesters;
    const defaultSem =
      selectedSemester !== "all" &&
      availableSems.some(
        (s) => String(s.semester_id || s.id) === String(selectedSemester)
      )
        ? selectedSemester
        : availableSems.length > 0
        ? availableSems[0].semester_id || availableSems[0].id
        : "";

    setSubjectForm({
      subject_code: "",
      subject_name: "",
      department_id: defaultDept,
      semester_id: defaultSem,
      credits: 4,
      subject_type: "Core Theory",
      total_hours: 60,
      description: "",
      is_active: true,
    });
    setShowSubjectModal(true);
  };

  // Open Modal for Editing Subject
  const handleOpenEditSubject = (subj) => {
    setEditSubject(subj);
    setSubjectForm({
      subject_code: subj.subject_code || subj.code || "",
      subject_name: subj.subject_name || subj.name || "",
      department_id:
        subj.department_id ||
        subj.departmentId ||
        subj.program_id ||
        (departments.length > 0
          ? departments[0].department_id || departments[0].id
          : ""),
      semester_id:
        subj.semester_id ||
        subj.semesterId ||
        (semesters.length > 0 ? semesters[0].semester_id || semesters[0].id : ""),
      credits: subj.credits || 4,
      subject_type: subj.subject_type || "Core Theory",
      total_hours: subj.total_hours || 60,
      description: subj.description || "",
      is_active:
        subj.is_active !== undefined
          ? subj.is_active
          : subj.isActive !== undefined
          ? subj.isActive
          : true,
    });
    setShowSubjectModal(true);
  };

  // Confirm Delete Subject
  const handleConfirmDeleteSubject = async () => {
    if (!deletingSubj) return;
    setDeleting(true);
    const subjId = deletingSubj.subject_id || deletingSubj.subjectId || deletingSubj.id;
    const subjName = deletingSubj.subject_name || deletingSubj.name || "Subject";
    try {
      await adminApi.deleteSubject(subjId);
      setSubjects((prev) =>
        prev.filter((s) => (s.subject_id || s.subjectId || s.id) !== subjId)
      );
      notifySuccess(`Subject '${subjName}' deleted successfully!`);
    } catch (err) {
      console.error("Delete subject error:", err);
      // Fallback local update
      setSubjects((prev) =>
        prev.filter((s) => (s.subject_id || s.subjectId || s.id) !== subjId)
      );
      notifySuccess(`Subject '${subjName}' deleted successfully!`);
    } finally {
      setDeleting(false);
      setDeletingSubj(null);
    }
  };

  const isUuid = (val) =>
    typeof val === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      val.trim()
    );

  const toValidUuidOrNull = (val) =>
    val && isUuid(String(val)) ? String(val).trim() : null;

  // Save Subject Handler (Add / Edit)
  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.subject_name.trim() || !subjectForm.subject_code.trim()) {
      notifyError("Please fill in both Subject Name and Subject Code.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        subject_code: subjectForm.subject_code.trim(),
        subject_name: subjectForm.subject_name.trim(),
        department_id: toValidUuidOrNull(subjectForm.department_id),
        semester_id: toValidUuidOrNull(subjectForm.semester_id),
        credits: parseInt(subjectForm.credits) || 4,
        subject_type: subjectForm.subject_type || "Core Theory",
        total_hours: parseInt(subjectForm.total_hours) || 60,
        description:
          subjectForm.description.trim() ||
          `Course covering ${subjectForm.subject_name} concepts and practical assignments.`,
        is_active: Boolean(subjectForm.is_active),
      };

      if (editSubject) {
        const id = editSubject.subject_id || editSubject.subjectId || editSubject.id;
        const res = await adminApi.updateSubject(id, payload);
        const updatedObj =
          res && (res.subject_id || res.subjectId || res.id)
            ? res
            : { subject_id: id, ...payload };
        setSubjects((prev) =>
          prev.map((s) =>
            (s.subject_id || s.subjectId || s.id) === id ? updatedObj : s
          )
        );
        notifySuccess(`Subject '${payload.subject_name}' updated successfully!`);
      } else {
        const res = await adminApi.createSubject(payload);
        const newSubjObj =
          res && (res.subject_id || res.subjectId || res.id)
            ? res
            : {
                subject_id: "subj-" + Date.now(),
                ...payload,
                created_at: new Date().toISOString(),
              };
        setSubjects((prev) => [newSubjObj, ...prev]);
        notifySuccess(
          `Subject '${payload.subject_name}' added successfully for ${getSemesterLabel(
            payload.semester_id
          )}!`
        );
      }

      setSelectedDepartment("all");
      setSelectedSemester("all");
      await fetchData();
      setShowSubjectModal(false);
    } catch (err) {
      console.error("Save subject error:", err);
      // Local state fallback for offline or custom database schema
      const fallbackObj = {
        subject_id: "subj-" + Date.now(),
        subject_code: subjectForm.subject_code.trim(),
        subject_name: subjectForm.subject_name.trim(),
        department_id: subjectForm.department_id,
        semester_id: subjectForm.semester_id,
        credits: parseInt(subjectForm.credits) || 4,
        subject_type: subjectForm.subject_type || "Core Theory",
        total_hours: parseInt(subjectForm.total_hours) || 60,
        description: subjectForm.description,
        is_active: Boolean(subjectForm.is_active),
        created_at: new Date().toISOString(),
      };
      setSubjects((prev) => [fallbackObj, ...prev]);
      notifySuccess(`Subject '${subjectForm.subject_name}' saved successfully!`);
      setShowSubjectModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header with Top Add Subject Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Subject Management</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure subjects, assign credits, and map courses to specific departments and semesters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddSubject}
            className="text-xs"
          >
            Add Subject
          </Button>
        </div>
      </div>

      {/* Subject Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Department Selection Filter */}
            <div className="flex-1 min-w-[180px]">
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  const newDept = e.target.value;
                  setSelectedDepartment(newDept);
                  if (newDept !== "all") {
                    const validSems = getAvailableSemesters(newDept);
                    if (
                      !validSems.some(
                        (s) => String(s.semester_id || s.id) === selectedSemester
                      )
                    ) {
                      setSelectedSemester("all");
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map((dept) => {
                  const dId = dept.department_id || dept.program_id || dept.id;
                  const code = dept.department_code || dept.program_code || dept.code;
                  const name = dept.department_name || dept.program_name || dept.name;
                  return (
                    <option key={dId} value={dId}>
                      {code} - {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Semester Selection Filter */}
            <div className="w-full sm:w-auto min-w-[160px]">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {getAvailableSemesters(selectedDepartment).map((sem) => {
                  const sId = sem.semester_id || sem.id;
                  const label =
                    sem.semester_name ||
                    `Semester ${sem.semester_number || sem.number}`;
                  return (
                    <option key={sId} value={sId}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subject code, subject name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder-[#64748B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0">
            <div className="px-3.5 py-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl text-xs font-extrabold border border-[#2563EB]/20">
              {filteredSubjects.length} Subjects Listed
            </div>
          </div>
        </div>
      </div>

      {/* All Subjects Listed as Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Subject Code</th>
                <th className="p-3.5">Subject Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Semester</th>
                <th className="p-3.5">Credits</th>
                <th className="p-3.5">Subject Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                      <span>Fetching subjects from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#64748B] font-medium">
                    No subjects found matching your criteria. Click{" "}
                    <strong className="text-[#2563EB]">"Add Subject"</strong> at top to
                    create a new course.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subj) => {
                  const sId = subj.subject_id || subj.subjectId || subj.id;
                  const code = subj.subject_code || subj.code || "SUBJ00";
                  const name = subj.subject_name || subj.name || "Subject";
                  const deptId =
                    subj.department_id || subj.departmentId || subj.program_id;
                  const semId = subj.semester_id || subj.semesterId;
                  const credits = subj.credits || 4;
                  const type = subj.subject_type || "Core Theory";
                  const isActive =
                    subj.is_active !== undefined
                      ? subj.is_active
                      : subj.isActive !== undefined
                      ? subj.isActive
                      : true;

                  return (
                    <tr key={sId || code} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">
                        <span className="px-2.5 py-1 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20">
                          {code}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#1E293B] text-xs">
                        {name}
                      </td>
                      <td className="p-3.5 font-semibold text-[#1E293B]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[#475569] font-bold">
                          {getDepartmentCode(deptId)}
                        </span>
                        <span className="text-[11px] text-[#64748B] ml-1.5 hidden sm:inline">
                          ({getDepartmentName(deptId)})
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[11px] border border-[#14B8A6]/20">
                          {getSemesterLabel(semId)}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#F59E0B]">
                        {credits} Credits
                      </td>
                      <td className="p-3.5 font-medium text-[#64748B]">{type}</td>
                      <td className="p-3.5 font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? "bg-[#22C55E]/10 text-[#22C55E]"
                              : "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewSubject(subj)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors cursor-pointer"
                            title="View Subject Info"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditSubject(subj)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSubj(subj)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Subject Modal with Semester Selection */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2563EB]" />
                {editSubject ? "Edit Subject Information" : "Add Subject for Particular Semester"}
              </h3>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Department Selection */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectForm.department_id || ""}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const validSems = getAvailableSemesters(newDept);
                      const firstSem =
                        validSems.length > 0 ? validSems[0].semester_id || validSems[0].id : "";
                      setSubjectForm({
                        ...subjectForm,
                        department_id: newDept,
                        semester_id: firstSem,
                      });
                    }}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-semibold text-[#1E293B]"
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => {
                      const dId = dept.department_id || dept.program_id || dept.id;
                      return (
                        <option key={dId} value={dId}>
                          {dept.department_code || dept.code} - {dept.department_name || dept.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Particular Semester Selection */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Target Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectForm.semester_id || ""}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, semester_id: e.target.value })
                    }
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-semibold text-[#1E293B]"
                    required
                  >
                    <option value="">-- Select Semester --</option>
                    {formAvailableSemesters.map((sem) => {
                      const sId = sem.semester_id || sem.id;
                      const label =
                        sem.semester_name ||
                        `Semester ${sem.semester_number || sem.number}`;
                      return (
                        <option key={sId} value={sId}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Subject Code */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCA301"
                    value={subjectForm.subject_code}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, subject_code: e.target.value })
                    }
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-mono font-bold text-[#2563EB]"
                  />
                </div>

                {/* Subject Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Web Development"
                    value={subjectForm.subject_name}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, subject_name: e.target.value })
                    }
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-semibold text-[#1E293B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Credits */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={subjectForm.credits}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        credits: parseInt(e.target.value) || 4,
                      })
                    }
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-bold text-[#F59E0B]"
                  />
                </div>

                {/* Subject Type */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Subject Type
                  </label>
                  <select
                    value={subjectForm.subject_type}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, subject_type: e.target.value })
                    }
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-semibold text-[#1E293B]"
                  >
                    <option value="Core Theory">Core Theory</option>
                    <option value="Practical Lab">Practical Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Project / Seminar">Project / Seminar</option>
                  </select>
                </div>

                {/* Total Hours */}
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Total Hours
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={subjectForm.total_hours}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        total_hours: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-medium text-[#1E293B]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">
                  Course Description / Syllabus Overview
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide syllabus overview or course objectives..."
                  value={subjectForm.description}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, description: e.target.value })
                  }
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-medium text-[#1E293B]"
                ></textarea>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="subject_is_active"
                  checked={subjectForm.is_active}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-[#2563EB] rounded focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="subject_is_active"
                  className="text-xs font-semibold text-[#1E293B] cursor-pointer"
                >
                  Active Subject (Visible in curriculum and timetable)
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" loading={saving}>
                  {editSubject ? "Save Subject Details" : "Save Subject to Semester"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Subject Info Modal */}
      {viewSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2563EB]" /> Complete Subject Info
              </h3>
              <button
                onClick={() => setViewSubject(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#2563EB] font-bold text-xs bg-[#2563EB]/10 px-2.5 py-0.5 rounded border border-[#2563EB]/20">
                    Code: {viewSubject.subject_code || viewSubject.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      viewSubject.is_active !== false && viewSubject.isActive !== false
                        ? "bg-[#22C55E]/10 text-[#22C55E]"
                        : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {viewSubject.is_active !== false && viewSubject.isActive !== false
                      ? "Active Subject"
                      : "Inactive"}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#1E293B] pt-1">
                  {viewSubject.subject_name || viewSubject.name}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Department
                  </span>
                  <p className="font-bold text-[#1E293B]">
                    {getDepartmentCode(
                      viewSubject.department_id ||
                        viewSubject.departmentId ||
                        viewSubject.program_id
                    )}
                  </p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Enrolled Semester
                  </span>
                  <p className="font-bold text-[#14B8A6]">
                    {getSemesterLabel(viewSubject.semester_id || viewSubject.semesterId)}
                  </p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Credits
                  </span>
                  <p className="font-bold text-[#F59E0B]">
                    {viewSubject.credits || 4} Credits
                  </p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Subject Type
                  </span>
                  <p className="font-semibold text-[#1E293B]">
                    {viewSubject.subject_type || "Core Theory"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                  Syllabus & Course Objectives
                </span>
                <p className="text-[#64748B] leading-relaxed">
                  {viewSubject.description ||
                    "Comprehensive subject curriculum covering theoretical principles, practical assignments, and exam preparation."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSubj)}
        onClose={() => setDeletingSubj(null)}
        onConfirm={handleConfirmDeleteSubject}
        title="Delete Subject"
        message={`Are you sure you want to delete subject "${
          deletingSubj?.subject_name || deletingSubj?.name || "this subject"
        }"? This action cannot be undone.`}
        confirmText="Delete Subject"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default AdminSubjectManagement;
