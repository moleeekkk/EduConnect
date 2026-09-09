import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Building2,
  Clock,
  Layers,
  Loader2,
  X,
  BookOpen,
} from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const AdminProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingProg, setDeletingProg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progData, deptData, instData] = await Promise.all([
        adminApi.getPrograms(),
        adminApi.getDepartments(),
        adminApi.getInstitutes(),
      ]);
      setPrograms(Array.isArray(progData) ? progData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setInstitutes(Array.isArray(instData) ? instData : []);
    } catch (err) {
      console.error("Program load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modal State
  const [showProgModal, setShowProgModal] = useState(false);
  const [editProg, setEditProg] = useState(null);
  const [progForm, setProgForm] = useState({
    program_code: "",
    program_name: "",
    department_id: "",
    institute_id: "",
    degree_type: "Master",
    total_semesters: 4,
    duration_years: 2,
    description: "",
    is_active: true,
  });

  const handleOpenAddProg = () => {
    setEditProg(null);
    setProgForm({
      program_code: "",
      program_name: "",
      department_id: departments.length > 0 ? (departments[0].department_id || departments[0].departmentId || "") : "",
      institute_id: institutes.length > 0 ? (institutes[0].institute_id || institutes[0].instituteId || "") : "",
      degree_type: "Master",
      total_semesters: 4,
      duration_years: 2,
      description: "",
      is_active: true,
    });
    setShowProgModal(true);
  };

  const handleOpenEditProg = (prog) => {
    setEditProg(prog);
    setProgForm({
      program_code: prog.program_code || prog.programCode || "",
      program_name: prog.program_name || prog.programName || "",
      department_id: prog.department_id || prog.departmentId || "",
      institute_id: prog.institute_id || prog.instituteId || "",
      degree_type: prog.degree_type || prog.degreeType || "Master",
      total_semesters: prog.total_semesters || prog.totalSemesters || 4,
      duration_years: prog.duration_years || prog.durationYears || 2,
      description: prog.description || "",
      is_active: prog.is_active !== undefined ? prog.is_active : true,
    });
    setShowProgModal(true);
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    if (!progForm.program_code || !progForm.program_name) {
      notifyError("Please fill in required fields (Program Code & Name)");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...progForm,
        duration_years: parseInt(progForm.duration_years) || 2,
        total_semesters: parseInt(progForm.total_semesters) || 4,
      };

      const progId = editProg?.program_id || editProg?.programId;
      if (progId) {
        await adminApi.updateProgram(progId, payload);
        notifySuccess(`Program '${progForm.program_name}' updated successfully!`);
      } else {
        await adminApi.createProgram(payload);
        notifySuccess(`Program '${progForm.program_name}' created successfully!`);
      }

      setShowProgModal(false);
      fetchData();
    } catch (err) {
      notifyError(err.response?.data?.message || err.response?.data?.error || "Failed to save Program");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (!deletingProg) return;
    setDeleting(true);
    try {
      const id = deletingProg.program_id || deletingProg.programId;
      await adminApi.deleteProgram(id);
      notifySuccess(`Program '${deletingProg.program_name || deletingProg.programName}' deleted successfully!`);
      setDeletingProg(null);
      fetchData();
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to delete Program");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#2563EB]" />
            <h1 className="text-2xl font-bold text-[#1E293B]">Academic Program Management</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 ml-8">
            Manage degree programs, duration, degree types, and semester offerings in PostgreSQL.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAddProg} className="text-xs">
          Add New Program
        </Button>
      </div>

      {/* Program Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
      ) : programs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
          <BookOpen className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-[#1E293B]">No Programs Found</h3>
          <p className="text-xs text-[#64748B]">Click "Add New Program" to register degree programs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => {
            const progId = prog.program_id || prog.programId;
            const progName = prog.program_name || prog.programName;
            const progCode = prog.program_code || prog.programCode;
            const degreeType = prog.degree_type || prog.degreeType || "Master";
            const totalSems = prog.total_semesters || prog.totalSemesters || 4;
            const duration = prog.duration_years || prog.durationYears || 2;
            const isActive = prog.is_active !== undefined ? prog.is_active : true;

            return (
              <div key={progId} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2563EB] transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full">
                      {progCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-[#64748B]"}`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1E293B]">{progName}</h3>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{prog.description || `${degreeType} degree program.`}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#2563EB]" /> {duration} Years</span>
                    <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-[#14B8A6]" /> {totalSems} Semesters</span>
                    <span className="font-semibold text-[#1E293B]">{degreeType}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEditProg(prog)} className="text-xs">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" icon={Trash2} onClick={() => setDeletingProg(prog)} className="text-xs text-red-600 border-red-200 hover:bg-red-50">
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Program Modal */}
      {showProgModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#E2E8F0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-lg font-bold text-[#1E293B]">
                {editProg ? "Edit Program" : "Add New Program"}
              </h3>
              <button onClick={() => setShowProgModal(false)} className="text-[#64748B] hover:text-[#1E293B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">Program Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MCA-REG"
                  value={progForm.program_code}
                  onChange={(e) => setProgForm({ ...progForm, program_code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master of Computer Applications"
                  value={progForm.program_name}
                  onChange={(e) => setProgForm({ ...progForm, program_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Degree Type</label>
                  <select
                    value={progForm.degree_type}
                    onChange={(e) => setProgForm({ ...progForm, degree_type: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="Master">Master</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Doctorate">Doctorate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={progForm.duration_years}
                    onChange={(e) => setProgForm({ ...progForm, duration_years: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">Total Semesters</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={progForm.total_semesters}
                  onChange={(e) => setProgForm({ ...progForm, total_semesters: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Program overview..."
                  value={progForm.description}
                  onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowProgModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={saving}>
                  {editProg ? "Save Changes" : "Create Program"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingProg && (
        <ConfirmModal
          isOpen={Boolean(deletingProg)}
          title="Delete Program"
          message={`Are you sure you want to delete program '${deletingProg.program_name || deletingProg.programName}'? This action cannot be undone.`}
          confirmText="Delete Program"
          onConfirm={handleDeleteProgram}
          onCancel={() => setDeletingProg(null)}
          isLoading={deleting}
        />
      )}
    </div>
  );
};

export default AdminProgramManagement;
