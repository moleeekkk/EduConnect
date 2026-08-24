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
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";

const AdminDepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingDept, setDeletingDept] = useState(null);

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
      institute_id: institutes.length > 0 ? (institutes[0].institute_id || institutes[0].instituteId || "") : "",
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
    try {
      await adminApi.deleteDepartment(id);
      await fetchData();
    } catch (err) {
      console.error("Delete department error:", err);
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
      if ((!instId || instId === "") && institutes.length > 0) {
        instId = institutes[0].institute_id || institutes[0].instituteId || "";
      }
      const payload = {
        department_code: deptForm.department_code,
        department_name: deptForm.department_name,
        institute_id: instId || null,
        duration_years: parseInt(deptForm.duration_years) || 2,
        description: deptForm.description || "",
        is_active: deptForm.is_active !== undefined ? deptForm.is_active : true,
      };

      if (editDept) {
        const id = editDept.department_id || editDept.departmentId || editDept.program_id;
        await adminApi.updateDepartment(id, payload);
      } else {
        await adminApi.createDepartment(payload);
      }
      await fetchData();
      setShowDeptModal(false);
    } catch (err) {
      console.error("Save department error:", err);
      setShowDeptModal(false);
    } finally {
      setSaving(false);
    }
  };

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

      {/* Listed Department Cards Grid */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
            <span>Fetching departments from database...</span>
          </div>
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
          No departments found in database. Click <strong>Add Department</strong> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
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
                    {inst && (
                      <p className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" /> {inst.institute_name || inst.instituteName}
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
                        <Layers className="w-3.5 h-3.5 text-[#14B8A6]" /> Configured Semesters
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editDept ? "Edit Department" : "Add New Department"}
              </h3>
              <button
                onClick={() => setShowDeptModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Department Code</label>
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
                <label className="block text-[#64748B] mb-1 font-semibold">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.department_name}
                  onChange={(e) => setDeptForm({ ...deptForm, department_name: e.target.value })}
                  placeholder="e.g. Department of Master of Computer Applications"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Belongs to Institute</label>
                <select
                  value={deptForm.institute_id}
                  onChange={(e) => setDeptForm({ ...deptForm, institute_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                >
                  {institutes.length === 0 ? (
                    <option value="">No Institutes Available</option>
                  ) : (
                    institutes.map((inst) => {
                      const id = inst.institute_id || inst.instituteId;
                      const name = inst.institute_name || inst.instituteName;
                      const code = inst.institute_code || inst.instituteCode;
                      return (
                        <option key={id} value={id}>
                          {name} ({code})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Duration in Years</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="6"
                  value={deptForm.duration_years}
                  onChange={(e) => setDeptForm({ ...deptForm, duration_years: e.target.value })}
                  placeholder="e.g. 2"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
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
                  className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="dept_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                  Department Active Status
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
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
