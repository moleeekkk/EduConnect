import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Building2,
  Clock,
  Layers,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const AdminDepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingDept, setDeletingDept] = useState(null);
  const [viewDept, setViewDept] = useState(null);
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptData, semData, instData] = await Promise.all([
        adminApi.getDepartments(),
        adminApi.getSemesters(),
        adminApi.getInstitutes(),
      ]);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setSemesters(Array.isArray(semData) ? semData : []);
      setInstitutes(Array.isArray(instData) ? instData : []);
    } catch (err) {
      console.error("Department load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add / Edit Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    department_code: "",
    department_name: "",
    institute_id: "",
    duration_years: 2,
    description: "",
    is_active: true,
  });

  // Open Add Department Modal
  const handleOpenAddDept = () => {
    setEditDept(null);
    setDeptForm({
      department_code: "",
      department_name: "",
      institute_id: "",
      duration_years: 2,
      description: "",
      is_active: true,
    });
    setShowDeptModal(true);
  };

  // Open Edit Department Modal
  const handleOpenEditDept = (dept, e) => {
    e.stopPropagation();
    setEditDept(dept);
    setDeptForm({
      department_code: dept.department_code || dept.departmentCode || dept.program_code || "",
      department_name: dept.department_name || dept.departmentName || dept.program_name || "",
      institute_id: dept.institute_id || dept.instituteId || "",
      duration_years: dept.duration_years || dept.durationYears || 2,
      description: dept.description || "",
      is_active: dept.is_active !== undefined ? dept.is_active : (dept.isActive !== undefined ? dept.isActive : true),
    });
    setShowDeptModal(true);
  };

  // Delete Department from database
  const handleConfirmDeleteDept = async () => {
    if (!deletingDept) return;
    setDeleting(true);
    const id = deletingDept.department_id || deletingDept.departmentId || deletingDept.program_id;
    const name = deletingDept.department_name || deletingDept.name || "Department";
    try {
      await adminApi.deleteDepartment(id);
      notifySuccess(`Department '${name}' deleted successfully!`);
      await fetchData();
    } catch (err) {
      console.error("Delete department error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to delete department.";
      notifyError(`Failed to delete department: ${msg}`);
      setDepartments((prev) =>
        prev.filter((d) => (d.department_id || d.departmentId || d.program_id) !== id)
      );
    } finally {
      setDeleting(false);
      setDeletingDept(null);
    }
  };

  // Save Department to database (Add or Edit)
  const handleSaveDept = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let instId = deptForm.institute_id;
      if (!instId || instId === "" || instId === "all") {
        instId = null;
      }
      const payload = {
        department_code: deptForm.department_code,
        department_name: deptForm.department_name,
        institute_id: instId,
        duration_years: parseInt(deptForm.duration_years) || 2,
        description: deptForm.description || "",
        is_active: deptForm.is_active !== undefined ? deptForm.is_active : true,
      };

      if (editDept) {
        const id = editDept.department_id || editDept.departmentId || editDept.program_id;
        await adminApi.updateDepartment(id, payload);
        notifySuccess(`Department '${deptForm.department_name}' updated successfully!`);
      } else {
        await adminApi.createDepartment(payload);
        notifySuccess(`Department '${deptForm.department_name}' created successfully in database!`);
      }
      await fetchData();
      setShowDeptModal(false);
    } catch (err) {
      console.error("Save department error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save department.";
      notifyError(`Failed to save department: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const instId = dept.institute_id || dept.instituteId;
    const matchesInstitute =
      selectedInstituteFilter === "all" ||
      String(instId) === String(selectedInstituteFilter);

    const query = searchQuery.trim().toLowerCase();
    const dCode = (dept.department_code || dept.departmentCode || dept.program_code || "").toLowerCase();
    const dName = (dept.department_name || dept.departmentName || dept.program_name || "").toLowerCase();
    const matchesSearch = query === "" || dCode.includes(query) || dName.includes(query);

    return matchesInstitute && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Department Management</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddDept} className="text-xs">
          Add Department
        </Button>
      </div>

      {/* Search & Institute Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Institute Filter */}
          <div className="w-full sm:w-auto min-w-[220px]">
            <select
              value={selectedInstituteFilter}
              onChange={(e) => setSelectedInstituteFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
            >
              <option value="all">All Institutes ({institutes.length})</option>
              {institutes.map((inst) => {
                const id = inst.institute_id || inst.instituteId;
                const name = inst.institute_name || inst.instituteName;
                const code = inst.institute_code || inst.instituteCode;
                return (
                  <option key={id} value={id}>
                    {code} - {name}
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
                placeholder="Search by department name or code..."
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

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 bg-[#2563EB]/10 text-[#2563EB] rounded-xl text-xs font-bold border border-[#2563EB]/20">
            {filteredDepartments.length} Department{filteredDepartments.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Listed Department Cards Grid */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
            <span>Fetching departments from database...</span>
          </div>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
          No departments found matching the filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => {
            const deptId = dept.department_id || dept.departmentId || dept.program_id || dept.programId;
            const deptCode = dept.department_code || dept.departmentCode || dept.program_code || dept.programCode;
            const deptName = dept.department_name || dept.departmentName || dept.program_name || dept.programName;
            const duration = dept.duration_years || dept.durationYears || 2;
            const deptSemesters = semesters.filter((s) => s.department_id === deptId || s.program_id === deptId || s.programId === deptId);
            const instId = dept.institute_id || dept.instituteId;
            const inst = institutes.find((i) => (i.institute_id || i.instituteId) === instId);

            return (
              <div
                key={deptId}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-200 group"
              >
                <div className="space-y-3">
                  {/* Card Header: Code Badge & Actions */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <span className="px-3 py-1 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs border border-[#2563EB]/20">
                      {deptCode}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setViewDept(dept); }}
                        className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors cursor-pointer"
                        title="View Department Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleOpenEditDept(dept, e)}
                        className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingDept(dept); }}
                        className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {deptName}
                    </h3>
                    {inst ? (
                      <p className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" /> {inst.institute_name || inst.instituteName}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#64748B] font-medium flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3 text-[#94A3B8]" /> All Institutes
                      </p>
                    )}
                  </div>

                  {/* Key Outside Details Box: Duration, Semesters */}
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Course Duration
                      </span>
                      <span className="font-extrabold text-[#1E293B]">{duration} Years</span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#14B8A6]" /> Semesters
                      </span>
                      <span className="font-mono font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded">
                        {deptSemesters.length} Semesters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Link to Semesters Module */}
                <Link
                  to="/admin/semesters"
                  className="pt-2 text-[11px] font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform flex items-center gap-1 cursor-pointer"
                >
                  Manage Semesters in Semesters Module &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B]">
                    {editDept ? "Edit Department" : "Add New Department"}
                  </h3>
                  <p className="text-xs text-[#64748B]">Configure department details and parameters</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeptModal(false)}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveDept} className="flex flex-col grow overflow-hidden space-y-4">
              <div className="overflow-y-auto pr-1 space-y-4 text-xs grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Department Code *</label>
                    <input
                      type="text"
                      required
                      value={deptForm.department_code}
                      onChange={(e) => setDeptForm({ ...deptForm, department_code: e.target.value })}
                      placeholder="e.g. MCA, BCA, BTECH-IT"
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Department Name *</label>
                    <input
                      type="text"
                      required
                      value={deptForm.department_name}
                      onChange={(e) => setDeptForm({ ...deptForm, department_name: e.target.value })}
                      placeholder="e.g. Department of Master of Computer Applications"
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Belongs to Institute</label>
                    <select
                      value={deptForm.institute_id || ""}
                      onChange={(e) => setDeptForm({ ...deptForm, institute_id: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                    >
                      <option value="">-- Select Institute --</option>
                      <option value="all">All Institutes</option>
                      {institutes.map((inst) => {
                        const id = inst.institute_id || inst.instituteId;
                        const name = inst.institute_name || inst.instituteName;
                        const code = inst.institute_code || inst.instituteCode;
                        return (
                          <option key={id} value={id}>
                            {name} ({code})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Duration in Years *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="6"
                      value={deptForm.duration_years}
                      onChange={(e) => setDeptForm({ ...deptForm, duration_years: e.target.value })}
                      placeholder="e.g. 2"
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Description & Overview</label>
                  <textarea
                    rows={3}
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    placeholder="e.g. Postgraduate department focusing on computer applications and software engineering."
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="dept_active"
                    checked={deptForm.is_active}
                    onChange={(e) => setDeptForm({ ...deptForm, is_active: e.target.checked })}
                    className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="dept_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                    Department Active Status
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0] shrink-0">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowDeptModal(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </span>
                  ) : (
                    "Save Department"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Department Details Modal */}
      {viewDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B]">Department Information</h3>
                  <p className="text-xs text-[#64748B]">Complete details of academic department</p>
                </div>
              </div>
              <button
                onClick={() => setViewDept(null)}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 space-y-4 text-xs grow">
              {(() => {
                const dCode = viewDept.department_code || viewDept.departmentCode || viewDept.program_code || viewDept.programCode || "N/A";
                const dName = viewDept.department_name || viewDept.departmentName || viewDept.program_name || viewDept.programName || "N/A";
                const duration = viewDept.duration_years || viewDept.durationYears || 2;
                const instId = viewDept.institute_id || viewDept.instituteId;
                const inst = institutes.find((i) => (i.institute_id || i.instituteId) === instId);
                const instName = inst ? (inst.institute_name || inst.instituteName) : (viewDept.institute_name || viewDept.instituteName || "All Institutes");
                const instCode = inst ? (inst.institute_code || inst.instituteCode) : "";
                const isActive = viewDept.is_active ?? viewDept.isActive ?? true;
                const dId = viewDept.department_id || viewDept.departmentId || viewDept.program_id || viewDept.programId;
                const deptSemesters = semesters.filter((s) => s.department_id === dId || s.program_id === dId || s.programId === dId);

                return (
                  <div className="space-y-4 text-xs">
                    {/* Top Banner Card: Code, Name, Institute & Status */}
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                        <span className="px-3.5 py-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs border border-[#2563EB]/20">
                          Code: {dCode}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                          {isActive ? "● Active Department" : "● Inactive Department"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Department Name</span>
                          <p className="font-extrabold text-base text-[#1E293B] leading-snug">{dName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Affiliated Institute</span>
                          <div className="flex items-center gap-1.5 font-bold text-[#1E293B] text-sm">
                            <Building2 className="w-4 h-4 text-[#2563EB]" />
                            <span>{instName}</span>
                            {instCode && (
                              <span className="font-mono text-xs text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded ml-1">
                                {instCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2-Column Content Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column: Academic Structure */}
                      <div className="space-y-3">
                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                          <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Course Duration
                          </span>
                          <p className="font-extrabold text-[#1E293B] text-sm">{duration} Years</p>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                          <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-[#14B8A6]" /> Configured Semesters Count
                          </span>
                          <p className="font-extrabold text-[#2563EB] text-sm">
                            {deptSemesters.length} {deptSemesters.length === 1 ? "Semester" : "Semesters"}
                          </p>
                        </div>

                        {deptSemesters.length > 0 && (
                          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Configured Semester Breakdown</span>
                            <div className="flex flex-wrap gap-1.5">
                              {deptSemesters.map((s, i) => (
                                <span key={s.semester_id || s.semesterId || i} className="bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#1E293B]">
                                  {s.semester_name || s.semesterName || `Semester ${s.semester_number || s.semesterNumber || i + 1}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Description & Audit Timestamps */}
                      <div className="space-y-3">
                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1 min-h-[90px]">
                          <span className="text-[10px] text-[#64748B] uppercase font-bold block">Description & Overview</span>
                          <p className="text-[#334155] leading-relaxed text-xs">
                            {viewDept.description || "No description provided for this department."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Created At</span>
                            <p className="font-mono text-[11px] text-[#1E293B] font-medium pt-0.5">
                              {viewDept.created_at || viewDept.createdAt
                                ? new Date(viewDept.created_at || viewDept.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "N/A"}
                            </p>
                          </div>

                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Updated At</span>
                            <p className="font-mono text-[11px] text-[#1E293B] font-medium pt-0.5">
                              {viewDept.updated_at || viewDept.updatedAt
                                ? new Date(viewDept.updated_at || viewDept.updatedAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-[#E2E8F0] shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewDept(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingDept)}
        onClose={() => setDeletingDept(null)}
        onConfirm={handleConfirmDeleteDept}
        title="Delete Department"
        message={`Are you sure you want to delete "${deletingDept?.department_name || deletingDept?.departmentName || deletingDept?.program_name || 'this department'}"? This action cannot be undone.`}
        confirmText="Delete Department"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default AdminDepartmentManagement;
