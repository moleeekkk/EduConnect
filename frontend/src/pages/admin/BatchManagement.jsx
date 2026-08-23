import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Filter, X, Loader2, Sparkles } from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { useBatch } from "../../context/BatchContext";

const AdminBatchManagement = () => {
  const { batches, selectedBatch, setSelectedBatch, refreshBatches } = useBatch();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("ALL");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editBatchItem, setEditBatchItem] = useState(null);
  const [formData, setFormData] = useState({
    batch_name: "",
    program_id: "",
    start_year: new Date().getFullYear(),
    end_year: new Date().getFullYear() + 2,
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progData] = await Promise.all([
        adminApi.getPrograms(),
        refreshBatches(),
      ]);
      setPrograms(Array.isArray(progData) ? progData : []);
    } catch (err) {
      console.error("Error loading data from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditBatchItem(null);
    setFormData({
      batch_name: "",
      program_id: programs.length > 0 ? (programs[0].program_id || programs[0].department_id || "") : "",
      start_year: new Date().getFullYear(),
      end_year: new Date().getFullYear() + 2,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (batch) => {
    setEditBatchItem(batch);
    setFormData({
      batch_name: batch.batch_name || batch.batchName || "",
      program_id: batch.program_id || batch.programId || "",
      start_year: batch.start_year || batch.startYear || new Date().getFullYear(),
      end_year: batch.end_year || batch.endYear || new Date().getFullYear() + 2,
      is_active: batch.is_active !== undefined ? batch.is_active : batch.isActive !== undefined ? batch.isActive : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editBatchItem) {
        const id = editBatchItem.batch_id || editBatchItem.batchId;
        await adminApi.updateBatch(id, formData);
      } else {
        await adminApi.createBatch(formData);
      }
      setShowModal(false);
      await refreshBatches();
    } catch (err) {
      console.error("Error saving batch to database:", err);
      alert("Failed to save batch to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteBatch = async () => {
    if (!deletingBatch) return;
    setDeleting(true);
    const batchId = deletingBatch.batch_id || deletingBatch.batchId;
    try {
      await adminApi.deleteBatch(batchId);
      await refreshBatches();
    } catch (err) {
      console.error("Error deleting batch:", err);
    } finally {
      setDeleting(false);
      setDeletingBatch(null);
    }
  };

  const handleToggleStatus = async (batchId) => {
    try {
      await adminApi.toggleBatchStatus(batchId);
      await refreshBatches();
    } catch (err) {
      console.error("Error toggling batch status:", err);
    }
  };

  // Helper map for program names
  const getProgramName = (progId) => {
    if (!progId) return "N/A";
    const found = programs.find(
      (p) =>
        p.program_id === progId ||
        p.department_id === progId ||
        p.programId === progId
    );
    return found ? (found.program_name || found.department_name) : "Computer Applications";
  };

  // Filtered List
  const filteredBatches = (batches || []).filter((b) => {
    const bName = (b.batch_name || b.batchName || "").toLowerCase();
    const matchesSearch = bName.includes(searchTerm.toLowerCase());
    const progId = b.program_id || b.programId;
    const matchesProgram =
      selectedProgramFilter === "ALL" || progId === selectedProgramFilter;
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Batches Management</h1>
        </div>

        <Button
          variant="accent"
          size="sm"
          icon={Plus}
          onClick={handleOpenAdd}
          className="text-xs w-auto"
        >
          Add New Batch
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batch by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#64748B]" />
          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] transition-all cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">All Programs</option>
            {programs.map((p) => {
              const pId = p.program_id || p.department_id || p.programId;
              const pName = p.program_name || p.department_name;
              return (
                <option key={pId} value={pId}>
                  {pName}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Batch Name</th>
                <th className="p-3.5">Program</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">System Selection</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                      <span>Fetching batches from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    No batches found in database. Click <strong>Add New Batch</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const bId = batch.batch_id || batch.batchId;
                  const bName = batch.batch_name || batch.batchName;
                  const sYear = batch.start_year || batch.startYear;
                  const eYear = batch.end_year || batch.endYear;
                  const isActive = batch.is_active !== undefined ? batch.is_active : batch.isActive;
                  const isCurrentSelected =
                    (selectedBatch?.batch_id || selectedBatch?.batchId) === bId;

                  return (
                    <tr key={bId} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 font-bold text-[#1E293B]">
                        {bName}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#475569] font-medium text-[11px]">
                          {getProgramName(batch.program_id || batch.programId)}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-[#334155]">
                        {sYear} - {eYear} <span className="text-[11px] text-[#64748B]">({eYear - sYear} Yrs)</span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(bId)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                            isActive
                              ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                              : "bg-rose-50 text-[#EF4444] border border-rose-200"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5">
                        {isCurrentSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-[#D97706] border border-amber-300 rounded-full font-semibold text-[11px]">
                            <Sparkles className="w-3 h-3" /> Selected Batch
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedBatch(batch)}
                            className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
                          >
                            Set Active
                          </button>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(batch)}
                          className="p-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded transition-colors cursor-pointer"
                          title="Edit Batch"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingBatch(batch)}
                          className="p-1 text-[#64748B] hover:text-[#EF4444] hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete Batch"
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

      {/* Add / Edit Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-[#E2E8F0] animate-fade-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <h2 className="text-sm font-bold text-[#1E293B]">
                {editBatchItem ? "Edit Batch Configuration" : "Add New Batch"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MCA 2024-2026 or Batch 2024"
                  value={formData.batch_name}
                  onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Academic Program / Department *</label>
                <select
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="">-- Select Program --</option>
                  {programs.map((p) => {
                    const pId = p.program_id || p.department_id || p.programId;
                    const pName = p.program_name || p.department_name;
                    return (
                      <option key={pId} value={pId}>
                        {pName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Start Year *</label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max="2100"
                    value={formData.start_year}
                    onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) || "" })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">End Year *</label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max="2100"
                    value={formData.end_year}
                    onChange={(e) => setFormData({ ...formData, end_year: parseInt(e.target.value) || "" })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB] transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#2563EB] rounded border-[#E2E8F0] focus:ring-[#2563EB] cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-[#1E293B] cursor-pointer">
                  Mark Batch as Active
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={saving}
                  variant="accent"
                  size="sm"
                  className="text-xs w-auto"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editBatchItem ? "Save Changes" : "Create Batch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingBatch)}
        onClose={() => setDeletingBatch(null)}
        onConfirm={handleConfirmDeleteBatch}
        title="Delete Batch"
        message={`Are you sure you want to delete batch "${deletingBatch?.batch_name || deletingBatch?.batchName || 'this batch'}"? This action cannot be undone.`}
        confirmText="Delete Batch"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default AdminBatchManagement;
