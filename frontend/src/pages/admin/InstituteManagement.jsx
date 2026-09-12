import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit, Trash2, Eye, Mail, Phone, MapPin, Layers, X, Loader2 } from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";


const AdminInstituteManagement = () => {
  const [institutes, setInstitutes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingInst, setDeletingInst] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [instData, progData] = await Promise.all([
        adminApi.getInstitutes(),
        adminApi.getPrograms(),
      ]);
      setInstitutes(Array.isArray(instData) ? instData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
    } catch (err) {
      console.error("Institute load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modal States
  const [viewInst, setViewInst] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editInst, setEditInst] = useState(null);
  const [form, setForm] = useState({
    institute_code: "",
    institute_name: "",
    description: "",
    contact_email: "",
    contact_mobile: "",
    campus_location: "",
    is_active: true,
  });

  const handleOpenAdd = () => {
    setEditInst(null);
    setForm({
      institute_code: "",
      institute_name: "",
      description: "",
      contact_email: "",
      contact_mobile: "",
      campus_location: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (inst) => {
    setEditInst(inst);
    setForm({
      institute_code: inst.institute_code || "",
      institute_name: inst.institute_name || "",
      description: inst.description || "",
      contact_email: inst.contact_email || "",
      contact_mobile: inst.contact_mobile || "",
      campus_location: inst.campus_location || "",
      is_active: inst.is_active !== undefined ? inst.is_active : true,
    });
    setShowModal(true);
  };

  const handleConfirmDeleteInst = async () => {
    if (!deletingInst) return;
    setDeleting(true);
    const id = deletingInst.institute_id || deletingInst.instituteId;
    const name = deletingInst.institute_name || deletingInst.name || "Institute";
    try {
      await adminApi.deleteInstitute(id);
      notifySuccess(`Institute '${name}' deleted successfully!`);
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to delete institute.";
      notifyError(`Failed to delete institute: ${msg}`);
    } finally {
      setDeleting(false);
      setDeletingInst(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editInst) {
        const id = editInst.institute_id || editInst.instituteId;
        await adminApi.updateInstitute(id, form);
        notifySuccess(`Institute '${form.institute_name}' updated successfully!`);
      } else {
        await adminApi.createInstitute(form);
        notifySuccess(`Institute '${form.institute_name}' added successfully to database!`);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      console.error("Save institute error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save institute to database.";
      notifyError(`Failed to save institute: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Institute Management</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAdd} className="text-xs">
          Add Institute
        </Button>
      </div>

      {/* Institutes Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Institute Code</th>
                <th className="p-3.5">Institute Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                      <span>Fetching institutes from database...</span>
                    </div>
                  </td>
                </tr>
              ) : institutes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    No institutes found in database. Click "Add Institute" to create one.
                  </td>
                </tr>
              ) : (
                institutes.map((inst) => {
                  const instId = inst.institute_id || inst.instituteId;
                  const instCode = inst.institute_code || inst.instituteCode;
                  const instName = inst.institute_name || inst.instituteName;
                  const isActive = inst.is_active !== undefined ? inst.is_active : inst.isActive;

                  return (
                    <tr key={instId} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">{instCode}</td>
                      <td className="p-3.5 font-semibold">{instName}</td>
                      <td className="p-3.5 text-[#64748B]">{inst.contact_email || inst.contactEmail || inst.email || "N/A"}</td>
                      <td className="p-3.5 text-[#64748B] font-mono">{inst.contact_mobile || inst.contactMobile || inst.phone || "N/A"}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewInst(inst)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors cursor-pointer"
                            title="View Institute Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(inst)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors cursor-pointer"
                            title="Edit Institute"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingInst(inst)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                            title="Delete Institute"
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

      {/* View Institute Details Modal */}
      {viewInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B]">Institute Information</h3>
                  <p className="text-xs text-[#64748B]">Complete details of academic institute</p>
                </div>
              </div>
              <button
                onClick={() => setViewInst(null)}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 space-y-4 text-xs grow">
              {/* Top Banner Card */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs border border-[#2563EB]/20">
                    Code: {viewInst.institute_code || viewInst.instituteCode}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${(viewInst.is_active ?? viewInst.isActive) ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                    {(viewInst.is_active ?? viewInst.isActive) ? "● Active Institute" : "● Inactive Institute"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Institute Name</span>
                  <h4 className="text-lg font-extrabold text-[#1E293B] leading-snug">{viewInst.institute_name || viewInst.instituteName}</h4>
                </div>
              </div>

              {/* 2-Column Content Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Contact & Location */}
                <div className="space-y-3">
                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#2563EB]" /> Official Email
                    </span>
                    <p className="font-bold text-[#2563EB] text-xs">{viewInst.contact_email || viewInst.contactEmail || "N/A"}</p>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#14B8A6]" /> Contact Phone
                    </span>
                    <p className="font-mono font-extrabold text-[#1E293B] text-xs">{viewInst.contact_mobile || viewInst.contactMobile || "N/A"}</p>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> Campus Location & Block
                    </span>
                    <p className="font-semibold text-[#1E293B] text-xs">{viewInst.campus_location || viewInst.campusLocation || "N/A"}</p>
                  </div>
                </div>

                {/* Right Column: Description & Associated Departments */}
                <div className="space-y-3">
                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1 min-h-[90px]">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Description & Overview</span>
                    <p className="text-[#334155] leading-relaxed text-xs">
                      {viewInst.description || "No description provided for this institute."}
                    </p>
                  </div>

                  {/* Associated Departments */}
                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#2563EB]" /> Offered Departments in this Institute
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {programs
                        .filter((p) => (p.institute_id || p.instituteId) === (viewInst.institute_id || viewInst.instituteId))
                        .map((p) => {
                          const id = p.program_id || p.programId;
                          const name = p.program_name || p.programName || p.department_name;
                          const code = p.program_code || p.programCode || p.department_code;
                          return (
                            <span key={id} className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-[11px]">
                              {name} ({code})
                            </span>
                          );
                        })}
                      {programs.filter((p) => (p.institute_id || p.instituteId) === (viewInst.institute_id || viewInst.instituteId)).length === 0 && (
                        <span className="text-[#64748B] text-xs italic">No departments linked yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-[#E2E8F0] shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewInst(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Institute Modal */}
      {showModal && (
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
                    {editInst ? "Edit Institute Information" : "Add New Institute Record"}
                  </h3>
                  <p className="text-xs text-[#64748B]">Configure institute details and contact info</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col grow overflow-hidden space-y-4">
              <div className="overflow-y-auto pr-1 space-y-4 text-xs grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Institute Code *</label>
                    <input
                      type="text"
                      required
                      value={form.institute_code}
                      onChange={(e) => setForm({ ...form, institute_code: e.target.value })}
                      placeholder="e.g. CA, CS, IT"
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Institute Name *</label>
                    <input
                      type="text"
                      required
                      value={form.institute_name}
                      onChange={(e) => setForm({ ...form, institute_name: e.target.value })}
                      placeholder="e.g. Institute of Computer Applications"
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Department Email *</label>
                    <input
                      type="email"
                      required
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      placeholder="e.g. ca.dept@educonnect.edu"
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">Department Phone *</label>
                    <input
                      type="text"
                      required
                      value={form.contact_mobile}
                      onChange={(e) => setForm({ ...form, contact_mobile: e.target.value })}
                      placeholder="e.g. +91 79 2630 1000"
                      className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Campus Location *</label>
                  <input
                    type="text"
                    required
                    value={form.campus_location}
                    onChange={(e) => setForm({ ...form, campus_location: e.target.value })}
                    placeholder="e.g. Academic Block A, Main Campus"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Description & Overview *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Premier department focusing on computer applications, IT, and software development."
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="inst_active"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="inst_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                    Institute Active Status
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0] shrink-0">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </span>
                  ) : (
                    "Save Institute"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingInst)}
        onClose={() => setDeletingInst(null)}
        onConfirm={handleConfirmDeleteInst}
        title="Delete Institute"
        message={`Are you sure you want to delete institute "${deletingInst?.institute_name || deletingInst?.instituteName || 'this institute'}"? This action cannot be undone.`}
        confirmText="Delete Institute"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default AdminInstituteManagement;
