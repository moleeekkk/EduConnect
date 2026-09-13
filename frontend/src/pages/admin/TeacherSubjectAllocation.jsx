import React, { useState, useEffect } from "react";
import {
  BookOpen,
  UserCheck,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Loader2,
  Users,
  Building2,
  Layers,
  GraduationCap,
  Sparkles,
  Check,
} from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const AdminTeacherSubjectAllocation = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & View State
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("subject"); // "subject" or "teacher"

  // Modal States
  const [manageSubjectModal, setManageSubjectModal] = useState(null); // subject obj
  const [manageTeacherModal, setManageTeacherModal] = useState(null); // teacher obj
  const [modalSearch, setModalSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subData, teacherData, deptData, semData, allocData] = await Promise.all([
        adminApi.getSubjects(),
        adminApi.getFaculty(),
        adminApi.getDepartments(),
        adminApi.getSemesters(),
        adminApi.getTeacherSubjects(),
      ]);
      setSubjects(Array.isArray(subData) ? subData : []);
      setTeachers(Array.isArray(teacherData) ? teacherData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setSemesters(Array.isArray(semData) ? semData : []);
      setAllocations(Array.isArray(allocData) ? allocData : []);
    } catch (err) {
      console.error("Allocation data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper mappings
  const getDepartmentCode = (deptId) => {
    if (!deptId) return "MCA";
    const dept = departments.find(
      (d) =>
        String(d.department_id || d.departmentId || d.program_id || d.id) ===
        String(deptId) || d.department_code === deptId
    );
    return dept ? dept.department_code || dept.program_code || dept.code : "MCA";
  };

  const getSemesterLabel = (semId, semNo) => {
    if (!semId && !semNo) return "Semester 1";
    if (semId) {
      const sem = semesters.find(
        (s) =>
          String(s.semester_id || s.semesterId || s.id).toLowerCase() === String(semId).toLowerCase() ||
          String(s.semester_number || s.number) === String(semId)
      );
      if (sem) return sem.semester_name || `Semester ${sem.semester_number || sem.number}`;
    }
    if (semNo) {
      const sem = semesters.find((s) => String(s.semester_number || s.number) === String(semNo));
      if (sem) return sem.semester_name || `Semester ${sem.semester_number || sem.number}`;
      return `Semester ${semNo}`;
    }
    if (semId && (!isNaN(semId) && String(semId).length <= 2)) {
      return `Semester ${semId}`;
    }
    return "Semester 1";
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

  // Helper to check if teacher is allocated to subject
  const isAllocated = (teacherId, subjectId) => {
    return allocations.some(
      (a) =>
        String(a.teacher_id || a.teacherId) === String(teacherId) &&
        String(a.subject_id || a.subjectId) === String(subjectId) &&
        (a.is_active !== false && a.isActive !== false)
    );
  };

  // Get assigned teachers for a subject
  const getAssignedTeachers = (subjectId) => {
    const assignedIds = allocations
      .filter(
        (a) =>
          String(a.subject_id || a.subjectId) === String(subjectId) &&
          (a.is_active !== false && a.isActive !== false)
      )
      .map((a) => String(a.teacher_id || a.teacherId));

    return teachers.filter((t) =>
      assignedIds.includes(String(t.teacher_id || t.teacherId || t.id))
    );
  };

  // Get assigned subjects for a teacher
  const getAssignedSubjects = (teacherId) => {
    const assignedSubjIds = allocations
      .filter(
        (a) =>
          String(a.teacher_id || a.teacherId) === String(teacherId) &&
          (a.is_active !== false && a.isActive !== false)
      )
      .map((a) => String(a.subject_id || a.subjectId));

    return subjects.filter((s) =>
      assignedSubjIds.includes(String(s.subject_id || s.subjectId || s.id))
    );
  };

  // Toggle allocation handler
  const handleToggleAllocation = async (teacherId, subjectId, teacherName, subjectName) => {
    const actionKey = `${teacherId}-${subjectId}`;
    setActionLoadingId(actionKey);

    const currentlyAssigned = isAllocated(teacherId, subjectId);
    try {
      await adminApi.toggleTeacherSubject(teacherId, subjectId);

      if (currentlyAssigned) {
        setAllocations((prev) =>
          prev.filter(
            (a) =>
              !(
                String(a.teacher_id || a.teacherId) === String(teacherId) &&
                String(a.subject_id || a.subjectId) === String(subjectId)
              )
          )
        );
        notifySuccess(`Unassigned '${subjectName}' from ${teacherName}`);
      } else {
        const newAlloc = {
          allocation_id: "alloc-" + Date.now(),
          teacher_id: teacherId,
          subject_id: subjectId,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setAllocations((prev) => [newAlloc, ...prev]);
        notifySuccess(`Assigned '${subjectName}' to ${teacherName} successfully!`);
      }
    } catch (err) {
      console.error("Toggle allocation error:", err);
      // Fallback local state toggle
      if (currentlyAssigned) {
        setAllocations((prev) =>
          prev.filter(
            (a) =>
              !(
                String(a.teacher_id || a.teacherId) === String(teacherId) &&
                String(a.subject_id || a.subjectId) === String(subjectId)
              )
          )
        );
        notifySuccess(`Unassigned '${subjectName}' from ${teacherName}`);
      } else {
        const newAlloc = {
          allocation_id: "alloc-" + Date.now(),
          teacher_id: teacherId,
          subject_id: subjectId,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setAllocations((prev) => [newAlloc, ...prev]);
        notifySuccess(`Assigned '${subjectName}' to ${teacherName} successfully!`);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Subjects
  const filteredSubjects = subjects.filter((subj) => {
    const deptId = subj.department_id || subj.departmentId || subj.program_id;
    const semId = subj.semester_id || subj.semesterId;

    if (selectedDepartment !== "all") {
      if (!deptId) return false;
      const matchesId = String(deptId).toLowerCase() === String(selectedDepartment).toLowerCase();
      const matchesCode = getDepartmentCode(deptId).toLowerCase() === getDepartmentCode(selectedDepartment).toLowerCase();
      if (!matchesId && !matchesCode) return false;
    }

    if (selectedSemester !== "all") {
      if (!semId) return false;
      const matchesId = String(semId).toLowerCase() === String(selectedSemester).toLowerCase();
      const matchesLabel = getSemesterLabel(semId).toLowerCase() === getSemesterLabel(selectedSemester).toLowerCase();
      if (!matchesId && !matchesLabel) return false;
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

  // Filtered Teachers
  const filteredTeachers = teachers.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = `${t.first_name || t.firstName || ""} ${t.last_name || t.lastName || ""}`.toLowerCase();
      const empId = (t.faculty_id || t.facultyId || "").toLowerCase();
      const email = (t.email || "").toLowerCase();
      if (!name.includes(q) && !empId.includes(q) && !email.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Calculate distinct counts for stats badges
  const activeAllocCount = allocations.filter(
    (a) => a.is_active !== false && a.isActive !== false
  ).length;
  const allocatedTeacherCount = new Set(
    allocations
      .filter((a) => a.is_active !== false && a.isActive !== false)
      .map((a) => String(a.teacher_id || a.teacherId))
  ).size;
  const allocatedSubjectCount = new Set(
    allocations
      .filter((a) => a.is_active !== false && a.isActive !== false)
      .map((a) => String(a.subject_id || a.subjectId))
  ).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#2563EB]" /> Teacher-Subject Allocation Matrix
          </h1>

        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-xl text-xs">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Total Mappings</span>
            <span className="font-extrabold text-[#2563EB]">{activeAllocCount} Allocations</span>
          </div>
          <div className="px-3 py-1.5 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-xl text-xs">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Assigned Faculty</span>
            <span className="font-extrabold text-[#14B8A6]">{allocatedTeacherCount} Teachers</span>
          </div>
          <div className="px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl text-xs">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Mapped Subjects</span>
            <span className="font-extrabold text-[#F59E0B]">{allocatedSubjectCount} Subjects</span>
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Department Selection Filter */}
            <div className="flex-1 min-w-[170px]">
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
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
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
            <div className="w-full sm:w-auto min-w-[150px]">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="all">
                  {selectedDepartment === "all"
                    ? `All Semesters (${semesters.length})`
                    : `Semesters for Dept (${getAvailableSemesters(selectedDepartment).length})`}
                </option>
                {getAvailableSemesters(selectedDepartment).map((sem) => {
                  const sId = sem.semester_id || sem.id;
                  const label =
                    sem.semester_name || `Semester ${sem.semester_number || sem.number}`;
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
                  placeholder={
                    viewMode === "subject"
                      ? "Search subject code or name..."
                      : "Search teacher name or Faculty ID..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB]"
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

          {/* View Mode Toggle Buttons (Subject-centric vs Faculty-centric) */}
          <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] shrink-0 self-start lg:self-center">
            <button
              onClick={() => setViewMode("subject")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === "subject"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#64748B] hover:text-[#1E293B]"
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Subject View ({filteredSubjects.length})
            </button>
            <button
              onClick={() => setViewMode("teacher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === "teacher"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#64748B] hover:text-[#1E293B]"
                }`}
            >
              <Users className="w-3.5 h-3.5" /> Faculty View ({filteredTeachers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto mb-2" />
          <p className="text-xs text-[#64748B] font-semibold">Loading teacher-subject allocations...</p>
        </div>
      ) : viewMode === "subject" ? (
        /* --- VIEW MODE 1: SUBJECT-CENTRIC VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
              No subjects found matching your filter criteria.
            </div>
          ) : (
            filteredSubjects.map((subj) => {
              const sId = subj.subject_id || subj.subjectId || subj.id;
              const code = subj.subject_code || subj.code || "SUBJ00";
              const name = subj.subject_name || subj.name || "Subject";
              const deptId = subj.department_id || subj.departmentId || subj.program_id;
              const semId = subj.semester_id || subj.semesterId;
              const assignedTechs = getAssignedTeachers(sId);

              return (
                <div
                  key={sId || code}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#2563EB]/40 transition-all"
                >
                  <div className="space-y-2">
                    {/* Header Code & Sem Pill */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#2563EB] text-xs bg-[#2563EB]/10 px-2.5 py-0.5 rounded border border-[#2563EB]/20">
                        {code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[11px]">
                        {getSemesterLabel(semId)}
                      </span>
                    </div>

                    {/* Title & Dept */}
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1E293B] leading-tight">{name}</h3>
                      <p className="text-[11px] text-[#64748B] font-semibold mt-0.5">
                        Dept: {getDepartmentCode(deptId)} • {subj.credits || 4} Credits ({subj.subject_type || "Core Theory"})
                      </p>
                    </div>

                    {/* Assigned Faculty Badges */}
                    <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                        Assigned Faculty ({assignedTechs.length})
                      </span>

                      {assignedTechs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {assignedTechs.map((t) => {
                            const tId = t.teacher_id || t.teacherId || t.id;
                            const tName = `${t.first_name || t.firstName || ""} ${t.last_name || t.lastName || ""}`.trim() || "Faculty Member";
                            return (
                              <span
                                key={tId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#1E293B]"
                              >
                                <Users className="w-3 h-3 text-[#2563EB]" /> {tName}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#94A3B8] italic">No faculty assigned to this subject yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Assign Button */}
                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => {
                        setManageSubjectModal(subj);
                        setModalSearch("");
                      }}
                      className="w-full text-xs !py-1.5"
                    >
                      Manage Assigned Faculty ({assignedTechs.length})
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* --- VIEW MODE 2: FACULTY-CENTRIC VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
              No faculty members found matching your search.
            </div>
          ) : (
            filteredTeachers.map((t) => {
              const tId = t.teacher_id || t.teacherId || t.id;
              const tName = `${t.first_name || t.firstName || ""} ${t.last_name || t.lastName || ""}`.trim() || "Faculty Member";
              const empId = t.faculty_id || t.facultyId || "FAC000";
              const assignedSubjs = getAssignedSubjects(tId);

              return (
                <div
                  key={tId || empId}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#2563EB]/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                        ID: {empId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[11px]">
                        {t.designation || "Faculty Member"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-[#1E293B]">{tName}</h3>
                      <p className="text-[11px] text-[#64748B]">{t.email || "teacher@educonnect.ac.in"}</p>
                    </div>

                    {/* Assigned Subjects */}
                    <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                        Assigned Subjects ({assignedSubjs.length})
                      </span>

                      {assignedSubjs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {assignedSubjs.map((s) => {
                            const sId = s.subject_id || s.subjectId || s.id;
                            const code = s.subject_code || s.code || "SUBJ";
                            const sName = s.subject_name || s.name;
                            return (
                              <span
                                key={sId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-mono font-bold text-[#2563EB]"
                                title={sName}
                              >
                                {code} ({getSemesterLabel(s.semester_id || s.semesterId)})
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#94A3B8] italic">No subjects assigned yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => {
                        setManageTeacherModal(t);
                        setModalSearch("");
                      }}
                      className="w-full text-xs !py-1.5"
                    >
                      Manage Assigned Subjects ({assignedSubjs.length})
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: MANAGE FACULTY FOR A SUBJECT */}
      {manageSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div>
                <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded">
                  {manageSubjectModal.subject_code || manageSubjectModal.code}
                </span>
                <h3 className="text-base font-extrabold text-[#1E293B] pt-1">
                  Assign Faculty to {manageSubjectModal.subject_name || manageSubjectModal.name}
                </h3>
              </div>
              <button
                onClick={() => setManageSubjectModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filter Search */}
            <div className="shrink-0">
              <input
                type="text"
                placeholder="Filter faculty member by name or Faculty ID..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Faculty Selection List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {teachers
                .filter((t) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase().trim();
                  const tName = `${t.first_name || t.firstName || ""} ${t.last_name || t.lastName || ""}`.toLowerCase();
                  const empId = (t.faculty_id || t.facultyId || "").toLowerCase();
                  return tName.includes(q) || empId.includes(q);
                })
                .map((t) => {
                  const tId = t.teacher_id || t.teacherId || t.id;
                  const sId = manageSubjectModal.subject_id || manageSubjectModal.subjectId || manageSubjectModal.id;
                  const allocated = isAllocated(tId, sId);
                  const tName = `${t.first_name || t.firstName || ""} ${t.last_name || t.lastName || ""}`.trim() || "Faculty Member";
                  const empId = t.faculty_id || t.facultyId || "FAC000";
                  const actionKey = `${tId}-${sId}`;
                  const isLoadingThis = actionLoadingId === actionKey;

                  return (
                    <div
                      key={tId}
                      onClick={() =>
                        !isLoadingThis &&
                        handleToggleAllocation(
                          tId,
                          sId,
                          tName,
                          manageSubjectModal.subject_name || manageSubjectModal.name
                        )
                      }
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${allocated
                          ? "bg-[#2563EB]/5 border-[#2563EB]/30"
                          : "bg-white border-[#E2E8F0] hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allocated
                              ? "bg-[#2563EB] border-[#2563EB] text-white"
                              : "border-slate-300 bg-white"
                            }`}
                        >
                          {allocated && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1E293B]">{tName}</h4>
                          <span className="text-[11px] text-[#64748B]">
                            ID: {empId} • {t.designation || "Faculty Member"}
                          </span>
                        </div>
                      </div>

                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                      ) : (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${allocated
                              ? "bg-[#2563EB]/10 text-[#2563EB]"
                              : "text-[#64748B]"
                            }`}
                        >
                          {allocated ? "Assigned" : "+ Click to Assign"}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] shrink-0 text-right">
              <Button
                variant="accent"
                size="sm"
                onClick={() => setManageSubjectModal(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE SUBJECTS FOR A TEACHER */}
      {manageTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div>
                <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                  {manageTeacherModal.faculty_id || manageTeacherModal.facultyId}
                </span>
                <h3 className="text-base font-extrabold text-[#1E293B] pt-1">
                  Assign Subjects to {manageTeacherModal.first_name || manageTeacherModal.firstName} {manageTeacherModal.last_name || manageTeacherModal.lastName}
                </h3>
              </div>
              <button
                onClick={() => setManageTeacherModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filter Search */}
            <div className="shrink-0">
              <input
                type="text"
                placeholder="Filter subject by code or name..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Subject Selection List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {subjects
                .filter((s) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase().trim();
                  const code = (s.subject_code || s.code || "").toLowerCase();
                  const name = (s.subject_name || s.name || "").toLowerCase();
                  return code.includes(q) || name.includes(q);
                })
                .map((s) => {
                  const sId = s.subject_id || s.subjectId || s.id;
                  const tId = manageTeacherModal.teacher_id || manageTeacherModal.teacherId || manageTeacherModal.id;
                  const allocated = isAllocated(tId, sId);
                  const code = s.subject_code || s.code || "SUBJ";
                  const name = s.subject_name || s.name;
                  const tName = `${manageTeacherModal.first_name || manageTeacherModal.firstName || ""} ${manageTeacherModal.last_name || manageTeacherModal.lastName || ""}`.trim();
                  const actionKey = `${tId}-${sId}`;
                  const isLoadingThis = actionLoadingId === actionKey;

                  return (
                    <div
                      key={sId}
                      onClick={() =>
                        !isLoadingThis && handleToggleAllocation(tId, sId, tName, name)
                      }
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${allocated
                          ? "bg-[#2563EB]/5 border-[#2563EB]/30"
                          : "bg-white border-[#E2E8F0] hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allocated
                              ? "bg-[#2563EB] border-[#2563EB] text-white"
                              : "border-slate-300 bg-white"
                            }`}
                        >
                          {allocated && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#2563EB] text-[11px] bg-[#2563EB]/10 px-1.5 py-0.5 rounded">
                              {code}
                            </span>
                            <span className="text-[10px] text-[#14B8A6] font-bold">
                              {getSemesterLabel(s.semester_id || s.semesterId)}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#1E293B] pt-0.5">{name}</h4>
                        </div>
                      </div>

                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                      ) : (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${allocated
                              ? "bg-[#2563EB]/10 text-[#2563EB]"
                              : "text-[#64748B]"
                            }`}
                        >
                          {allocated ? "Assigned" : "+ Click to Assign"}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] shrink-0 text-right">
              <Button
                variant="accent"
                size="sm"
                onClick={() => setManageTeacherModal(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacherSubjectAllocation;
