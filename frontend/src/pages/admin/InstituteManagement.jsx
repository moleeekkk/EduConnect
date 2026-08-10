import React, { useState } from "react";
import { Building2, Plus, Edit, Trash2, Eye, CheckCircle2, AlertCircle, Mail, Phone, MapPin, Layers } from "lucide-react";
import Button from "../../components/common/Button";
import { mockInstitutes, mockPrograms } from "../../data/mockData";

const AdminInstituteManagement = () => {
  const [institutes, setInstitutes] = useState(mockInstitutes);

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
      contact_email: "dept@educonnect.edu",
      contact_mobile: "+91 79 2630 1000",
      campus_location: "Academic Block A, Main Campus",
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
      contact_email: inst.contact_email || "dept@educonnect.edu",
      contact_mobile: inst.contact_mobile || "+91 79 2630 1000",
      campus_location: inst.campus_location || "Academic Block A, Main Campus",
      is_active: inst.is_active !== undefined ? inst.is_active : true,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this institute?")) {
      setInstitutes(institutes.filter((i) => i.institute_id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editInst) {
      setInstitutes(
        institutes.map((i) => (i.institute_id === editInst.institute_id ? { ...i, ...form, updated_at: new Date().toISOString() } : i))
      );
    } else {
      const created = {
        institute_id: `inst-00${institutes.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...form,
      };
      setInstitutes([...institutes, created]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Institute & School Management (institutes Table)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Admin control center to view details, add, edit all institute information, and delete records</p>
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
                <th className="p-3.5">Institute Code (institute_code)</th>
                <th className="p-3.5">Institute Name (institute_name)</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Status (is_active)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {institutes.map((inst) => (
                <tr key={inst.institute_id} className="hover:bg-[#F8FAFC]">
                  <td className="p-3.5 font-mono font-bold text-[#2563EB]">{inst.institute_code}</td>
                  <td className="p-3.5 font-semibold">{inst.institute_name}</td>
                  <td className="p-3.5 text-[#64748B] max-w-md truncate">{inst.description}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${inst.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                      {inst.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 shrink-0">
                    <button
                      onClick={() => setViewInst(inst)}
                      className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors"
                      title="View Institute Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(inst)}
                      className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors"
                      title="Edit Full Info"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(inst.institute_id)}
                      className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors"
                      title="Delete Institute"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Institute Details Modal */}
      {viewInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2563EB]" /> Complete Institute Profile Information
              </h3>
              <Button variant="outline" size="sm" onClick={() => setViewInst(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#2563EB] font-bold text-xs bg-[#2563EB]/10 px-2.5 py-0.5 rounded">
                    Code: {viewInst.institute_code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewInst.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                    {viewInst.is_active ? "Active Status" : "Inactive Status"}
                  </span>
                </div>
                <h4 className="text-lg font-extrabold text-[#1E293B] pt-1">{viewInst.institute_name}</h4>
                <p className="text-xs text-[#64748B] font-mono">Institute ID: {viewInst.institute_id}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Department Email</span>
                  <p className="font-medium text-[#2563EB]">{viewInst.contact_email || "dept@educonnect.edu"}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Department Phone</span>
                  <p className="font-mono text-[#1E293B] font-bold">{viewInst.contact_mobile || "+91 79 2630 1000"}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Campus Location & Block</span>
                <p className="font-medium text-[#1E293B]">{viewInst.campus_location || "Academic Block A, Main Campus"}</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Detailed Overview & Description</span>
                <p className="font-medium text-[#1E293B] leading-relaxed">{viewInst.description}</p>
              </div>

              {/* Associated Programs */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Offered Programs in this Institute</span>
                <div className="flex flex-wrap gap-2">
                  {mockPrograms
                    .filter((p) => p.institute_id === viewInst.institute_id)
                    .map((p) => (
                      <span key={p.program_id} className="px-2.5 py-1 rounded bg-white border border-[#E2E8F0] text-[#1E293B] font-bold text-[11px]">
                        {p.program_name} ({p.program_code})
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Institute Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editInst ? "Edit Complete Institute Information" : "Add New Institute Record"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Institute Code (institute_code)</label>
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
                  <label className="block text-[#64748B] mb-1 font-semibold">Institute Name (institute_name)</label>
                  <input
                    type="text"
                    required
                    value={form.institute_name}
                    onChange={(e) => setForm({ ...form, institute_name: e.target.value })}
                    placeholder="e.g. Computer Applications"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Department Email (contact_email)</label>
                  <input
                    type="email"
                    required
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Department Phone (contact_mobile)</label>
                  <input
                    type="text"
                    required
                    value={form.contact_mobile}
                    onChange={(e) => setForm({ ...form, contact_mobile: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Campus Location (campus_location)</label>
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
                <label className="block text-[#64748B] mb-1 font-semibold">Description & Overview (description)</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inst_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="inst_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                  Institute Active Status (is_active)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Institute
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstituteManagement;
