import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit, Trash2, Eye, X } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const AdminInstituteManagement = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getInstitutes();
      setInstitutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch institutes error:", err);
      setInstitutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutes();
  }, []);

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
    setForm({ ...inst });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this institute?")) {
      try {
        await adminApi.deleteInstitute(id);
        loadInstitutes();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete institute");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editInst) {
        await adminApi.updateInstitute(editInst.institute_id, form);
      } else {
        await adminApi.createInstitute(form);
      }
      setShowModal(false);
      loadInstitutes();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
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
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-[#64748B]">
                    Loading institute records from database...
                  </td>
                </tr>
              ) : institutes && institutes.length > 0 ? (
                institutes.map((inst) => (
                  <tr key={inst.institute_id} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-mono font-bold text-[#2563EB]">{inst.institute_code}</td>
                    <td className="p-3.5 font-semibold">{inst.institute_name}</td>
                    <td className="p-3.5 text-[#64748B] max-w-md truncate">{inst.description}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${inst.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                        {inst.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewInst(inst)}
                          className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(inst)}
                          className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6]"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inst.institute_id)}
                          className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-[#64748B]">
                    No institutes added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {viewInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                Institute Profile Information
              </h3>
              <button
                onClick={() => setViewInst(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <h4 className="text-lg font-extrabold text-[#1E293B]">{viewInst.institute_name}</h4>
                <p className="text-xs text-[#64748B] font-mono">Code: {viewInst.institute_code}</p>
                <p className="text-xs text-[#64748B] pt-2">{viewInst.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editInst ? "Edit Institute Information" : "Add New Institute Record"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Institute Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editInst}
                    value={form.institute_code}
                    onChange={(e) => setForm({ ...form, institute_code: e.target.value })}
                    placeholder="e.g. Code..."
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Institute Name</label>
                  <input
                    type="text"
                    required
                    value={form.institute_name}
                    onChange={(e) => setForm({ ...form, institute_name: e.target.value })}
                    placeholder="e.g. Name..."
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
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
