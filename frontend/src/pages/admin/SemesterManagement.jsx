import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  BookOpen,
  Eye,
  X,
} from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const SemesterManagement = () => {
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingSem, setDeletingSem] = useState(null);
  const [viewSem, setViewSem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  // Modal State for Add / Edit Semester
  const [showModal, setShowModal] = useState(false);
  const [editSem, setEditSem] = useState(null);
  const [semForm, setSemForm] = useState({
    department_id: "",
    semester_number: 1,
    semester_name: "Semester 1",
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [semData, deptData] = await Promise.all([
        adminApi.getSemesters(),
        adminApi.getDepartments(),
      ]);
      setSemesters(Array.isArray(semData) ? semData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err) {
      console.error("Failed to load semesters data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditSem(null);
    const defaultDept = departments.length > 0
      ? (departments[0].department_id || departments[0].departmentId || "")
      : "";

    setSemForm({
      department_id: defaultDept,
      semester_number: 1,
      semester_name: "Semester 1",
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (sem) => {
    setEditSem(sem);
    const semDeptId = sem.department_id || sem.departmentId || "";
    setSemForm({
      department_id: semDeptId,
      semester_number: sem.semester_number || sem.semesterNumber || 1,
      semester_name: sem.semester_name || sem.semesterName || "",
      is_active: sem.is_active !== undefined ? sem.is_active : (sem.isActive !== undefined ? sem.isActive : true),
    });
    setShowModal(true);
  };

  const handleSaveSemester = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let deptId = semForm.department_id;
      if ((!deptId || deptId === "") && departments.length > 0) {
        deptId = departments[0].department_id || departments[0].departmentId || "";
      }

      const payload = {
        department_id: deptId,
        semester_number: parseInt(semForm.semester_number) || 1,
        semester_name: semForm.semester_name || `Semester ${semForm.semester_number}`,
        is_active: semForm.is_active,
      };

      if (editSem) {
        const id = editSem.semester_id || editSem.semesterId;
        const res = await adminApi.updateSemester(id, payload);
        const updatedObj = (res && (res.semester_id || res.semesterId))
          ? res
          : { semester_id: id, ...payload };
        setSemesters((prev) =>
          prev.map((s) => ((s.semester_id || s.semesterId) === id ? updatedObj : s))
        );
        notifySuccess(`Semester '${payload.semester_name}' updated successfully!`);
      } else {
        const res = await adminApi.createSemester(payload);
        const newSemObj = (res && (res.semester_id || res.semesterId))
          ? res
          : {
            semester_id: "sem-" + Date.now(),
            ...payload,
            created_at: new Date().toISOString(),
          };
        setSemesters((prev) => [...prev, newSemObj]);
        notifySuccess(`Semester '${payload.semester_name}' created successfully in database!`);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      console.error("Save semester error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save semester.";
      notifyError(`Failed to save semester: ${msg}`);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteSemester = async () => {
    if (!deletingSem) return;
    setDeleting(true);
    const id = deletingSem.semester_id || deletingSem.semesterId;
    const name = deletingSem.semester_name || deletingSem.name || `Semester ${deletingSem.semester_number || ""}`;
    try {
      await adminApi.deleteSemester(id);
      notifySuccess(`Semester '${name}' deleted successfully!`);
      setSemesters((prev) => prev.filter((s) => (s.semester_id || s.semesterId) !== id));
    } catch (err) {
      console.error("Delete semester error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to delete semester.";
      notifyError(`Failed to delete semester: ${msg}`);
    } finally {
      setDeleting(false);
      setDeletingSem(null);
    }
  };

  const handleToggleStatus = async (sem) => {
    const id = sem.semester_id || sem.semesterId;
    const name = sem.semester_name || sem.name || `Semester ${sem.semester_number || ""}`;
    try {
      await adminApi.toggleSemesterStatus(id);
      setSemesters((prev) =>
        prev.map((s) =>
          (s.semester_id || s.semesterId) === id
            ? { ...s, is_active: !(s.is_active !== undefined ? s.is_active : s.isActive) }
            : s
        )
      );
      notifySuccess(`Semester '${name}' status toggled successfully!`);
    } catch (err) {
      console.error("Toggle status error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to toggle semester status.";
      notifyError(`Failed to toggle status: ${msg}`);
    }
  };

  // Filter Logic
  const filteredSemesters = semesters.filter((sem) => {
    const semName = (sem.semester_name || sem.semesterName || "").toLowerCase();
    const semNum = String(sem.semester_number || sem.semesterNumber || "");
    const semDeptId = sem.program_id || sem.programId || sem.department_id || sem.departmentId;

    const matchedDept = departments.find(
      (d) => (d.department_id || d.departmentId || d.program_id) === semDeptId
    );
    const deptName = (matchedDept?.department_name || matchedDept?.departmentName || "").toLowerCase();
    const deptCode = (matchedDept?.department_code || matchedDept?.departmentCode || "").toLowerCase();

    const matchesSearch =
      semName.includes(searchTerm.toLowerCase()) ||
      semNum.includes(searchTerm) ||
      deptName.includes(searchTerm.toLowerCase()) ||
      deptCode.includes(searchTerm.toLowerCase());

    const matchesDeptFilter =
      selectedDeptFilter === "ALL" || semDeptId === selectedDeptFilter;

    return matchesSearch && matchesDeptFilter;
  });

  const activeCount = semesters.filter((s) => s.is_active !== false && s.isActive !== false).length;
  const inactiveCount = semesters.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Semesters Management</h1>

        </div>

        <Button
          variant="accent"
          size="sm"
          icon={Plus}
          onClick={handleOpenAddModal}
          className="text-xs w-full sm:w-auto"
        >
          Add New Semester
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2563EB]/10 rounded-lg text-[#2563EB]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Total Semesters
              </p>
              <p className="text-lg font-bold text-[#1E293B]">{semesters.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#22C55E]/10 rounded-lg text-[#22C55E]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Active Terms
              </p>
              <p className="text-lg font-bold text-[#1E293B]">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-lg text-gray-500">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Inactive Terms
              </p>
              <p className="text-lg font-bold text-[#1E293B]">{inactiveCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#14B8A6]/10 rounded-lg text-[#14B8A6]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Departments
              </p>
              <p className="text-lg font-bold text-[#1E293B]">{departments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search semester or department..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#2563EB] bg-[#F8FAFC]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-[#64748B] font-semibold whitespace-nowrap">
            Department:
          </label>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full md:w-64 p-2 rounded-lg border border-[#E2E8F0] text-xs bg-[#F8FAFC] font-semibold text-[#1E293B]"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((d) => {
              const dId = d.department_id || d.departmentId || d.program_id;
              const dCode = d.department_code || d.departmentCode || d.program_code;
              const dName = d.department_name || d.departmentName || d.program_name;
              return (
                <option key={dId} value={dId}>
                  {dCode} - {dName}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Semesters Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">S. N.</th>
                <th className="p-3.5">Semester Name</th>
                <th className="p-3.5">Semester Number</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Created At</th>
                <th className="p-3.5">Updated At</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                      <span>Loading semesters from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSemesters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#64748B]">
                    No semesters found in database. Click "Add New Semester" to create one.
                  </td>
                </tr>
              ) : (
                filteredSemesters.map((sem, idx) => {
                  const semId = sem.semester_id || sem.semesterId;
                  const semName = sem.semester_name || sem.semesterName || "Semester";
                  const semNum = sem.semester_number || sem.semesterNumber || 1;
                  const isActive = sem.is_active !== undefined ? sem.is_active : (sem.isActive !== undefined ? sem.isActive : true);
                  const semDeptId = sem.program_id || sem.programId || sem.department_id || sem.departmentId;

                  const dept = departments.find(
                    (d) => (d.department_id || d.departmentId || d.program_id) === semDeptId
                  );
                  const deptCode = dept ? (dept.department_code || dept.departmentCode || dept.program_code) : "N/A";
                  const deptName = dept ? (dept.department_name || dept.departmentName || dept.program_name) : "Unassigned Department";

                  return (
                    <tr key={semId} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 font-bold text-[#64748B]">
                        {idx + 1}
                      </td>

                      <td className="p-3.5 font-extrabold text-[#1E293B]">{semName}</td>

                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">
                        <span className="bg-[#2563EB]/10 border border-[#2563EB]/20 px-2.5 py-0.5 rounded text-[11px]">
                          Sem {semNum}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span className="font-semibold text-[#1E293B]">{deptName}</span>
                          <span className="text-[10px] font-mono text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded">
                            ({deptCode})
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive
                            ? "bg-[#22C55E]/10 text-[#22C55E]"
                            : "bg-gray-200 text-gray-600"
                            }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-3.5 text-[#64748B] font-mono text-[11px]">
                        {sem.created_at || sem.createdAt ? new Date(sem.created_at || sem.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                      </td>

                      <td className="p-3.5 text-[#64748B] font-mono text-[11px]">
                        {sem.updated_at || sem.updatedAt ? new Date(sem.updated_at || sem.updatedAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setViewSem({ ...sem, index: idx + 1, deptName, deptCode })}
                          className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors cursor-pointer"
                          title="View Semester Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(sem)}
                          className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors cursor-pointer"
                          title="Edit Semester"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSem(sem)}
                          className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                          title="Delete Semester"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Semester Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-[#1E293B]">
              {editSem ? "Edit Semester" : "Add New Semester"}
            </h2>

            <form onSubmit={handleSaveSemester} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">
                  Department
                </label>
                <select
                  required
                  value={semForm.department_id}
                  onChange={(e) => setSemForm({ ...semForm, department_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                >
                  {departments.length === 0 ? (
                    <option value="">No Departments Available</option>
                  ) : (
                    departments.map((d) => {
                      const dId = d.department_id || d.departmentId;
                      const dCode = d.department_code || d.departmentCode;
                      const dName = d.department_name || d.departmentName;
                      return (
                        <option key={dId} value={dId}>
                          {dName} ({dCode})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">
                    Semester Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={semForm.semester_number}
                    onChange={(e) => {
                      const num = parseInt(e.target.value) || 1;
                      setSemForm({
                        ...semForm,
                        semester_number: num,
                        semester_name: semForm.semester_name === `Semester ${semForm.semester_number}` ? `Semester ${num}` : semForm.semester_name,
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Status</label>
                  <select
                    value={semForm.is_active ? "true" : "false"}
                    onChange={(e) => setSemForm({ ...semForm, is_active: e.target.value === "true" })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">
                  Semester Name
                </label>
                <input
                  type="text"
                  required
                  value={semForm.semester_name}
                  onChange={(e) => setSemForm({ ...semForm, semester_name: e.target.value })}
                  placeholder="e.g. Semester 1, Term 1"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-extrabold text-[#1E293B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <Button variant="accent" size="sm" type="submit" disabled={saving}>
                  {saving ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Semester"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSem)}
        onClose={() => setDeletingSem(null)}
        onConfirm={handleConfirmDeleteSemester}
        title="Delete Semester"
        message={`Are you sure you want to delete "${deletingSem?.semester_name || deletingSem?.semesterName || 'this semester'}"? This action cannot be undone.`}
        confirmText="Delete Semester"
        loading={deleting}
        variant="danger"
      />

      {/* View Semester Details Modal */}
      {viewSem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2563EB]" /> Semester Details
              </h3>
              <button
                onClick={() => setViewSem(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${(viewSem.is_active ?? viewSem.isActive ?? true) ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                  {(viewSem.is_active ?? viewSem.isActive ?? true) ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Semester Name & Number</span>
                <p className="font-extrabold text-sm text-[#1E293B]">{viewSem.semester_name || viewSem.semesterName || "Semester"}</p>
                <span className="font-mono text-[#2563EB] font-bold text-xs bg-[#2563EB]/10 px-2 py-0.5 rounded inline-block mt-1">
                  Semester Number: {viewSem.semester_number || viewSem.semesterNumber || 1}
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Department</span>
                <p className="font-bold text-[#1E293B]">{viewSem.deptName || "Unassigned Department"}</p>
                {viewSem.deptCode && (
                  <span className="font-mono text-xs text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded inline-block">
                    Code: {viewSem.deptCode}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">Created At</span>
                  <p className="font-mono text-[11px] text-[#1E293B] font-medium pt-0.5">
                    {viewSem.created_at || viewSem.createdAt ? new Date(viewSem.created_at || viewSem.createdAt).toLocaleString("en-IN") : "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">Updated At</span>
                  <p className="font-mono text-[11px] text-[#1E293B] font-medium pt-0.5">
                    {viewSem.updated_at || viewSem.updatedAt ? new Date(viewSem.updated_at || viewSem.updatedAt).toLocaleString("en-IN") : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setViewSem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterManagement;
