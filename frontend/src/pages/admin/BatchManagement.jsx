import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, X, Loader2, Sparkles } from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { useBatch } from "../../context/BatchContext";
import { notifySuccess, notifyError } from "../../utils/toast";


const AdminBatchManagement = () => {
  const { batches, selectedBatch, setSelectedBatch, refreshBatches } = useBatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 16 }, (_, i) => 2020 + i);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editBatchItem, setEditBatchItem] = useState(null);
  const [formData, setFormData] = useState({
    batch_name: "",
    start_year: currentYear,
    end_year: currentYear + 2,
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      await refreshBatches();
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
      start_year: currentYear,
      end_year: currentYear + 2,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (batch) => {
    setEditBatchItem(batch);
    const sYr = parseInt(batch.start_year || batch.startYear) || currentYear;
    const eYr = parseInt(batch.end_year || batch.endYear) || (sYr + 2);
    setFormData({
      batch_name: batch.batch_name || batch.batchName || "",
      start_year: sYr,
      end_year: eYr >= sYr ? eYr : sYr + 2,
      is_active: batch.is_active !== undefined ? batch.is_active : batch.isActive !== undefined ? batch.isActive : true,
    });
    setShowModal(true);
  };

  const handleStartYearChange = (newStart) => {
    const startVal = parseInt(newStart);
    let endVal = parseInt(formData.end_year);
    if (isNaN(endVal) || endVal < startVal) {
      endVal = startVal + 2;
    }
    setFormData({
      ...formData,
      start_year: startVal,
      end_year: endVal,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startYr = parseInt(formData.start_year);
    const endYr = parseInt(formData.end_year);

    if (endYr < startYr) {
      notifyError("End Year cannot be less than Start Year.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        batch_name: formData.batch_name,
        department_id: null,
        program_id: null,
        start_year: startYr,
        end_year: endYr,
        is_active: formData.is_active,
      };
      if (editBatchItem) {
        const id = editBatchItem.batch_id || editBatchItem.batchId;
        await adminApi.updateBatch(id, payload);
        notifySuccess(`Batch '${formData.batch_name}' updated successfully!`);
      } else {
        await adminApi.createBatch(payload);
        notifySuccess(`Batch '${formData.batch_name}' created successfully in database!`);
      }
      setShowModal(false);
      await refreshBatches();
    } catch (err) {
      console.error("Error saving batch to database:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save batch to database.";
      notifyError(`Failed to save batch: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteBatch = async () => {
    if (!deletingBatch) return;
    setDeleting(true);
    const batchId = deletingBatch.batch_id || deletingBatch.batchId;
    const bName = deletingBatch.batch_name || deletingBatch.batchName || "Batch";
    try {
      await adminApi.deleteBatch(batchId);
      notifySuccess(`Batch '${bName}' deleted successfully!`);
      await refreshBatches();
    } catch (err) {
      console.error("Error deleting batch:", err);
      const msg = err.response?.data?.error || err.message || "Failed to delete batch.";
      notifyError(`Failed to delete batch: ${msg}`);
    } finally {
      setDeleting(false);
      setDeletingBatch(null);
    }
  };

  // Filtered List
  const filteredBatches = (batches || []).filter((b) => {
    const bName = (b.batch_name || b.batchName || "").toLowerCase();
    return bName.includes(searchTerm.toLowerCase());
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
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Batch Name</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">System Selection</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                      <span>Fetching batches from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#64748B]">
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
                      <td className="p-3.5 font-medium text-[#334155]">
                        {sYear} - {eYear} <span className="text-[11px] text-[#64748B]">({eYear - sYear} Yrs)</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isActive
                            ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                            : "bg-rose-50 text-[#EF4444] border border-rose-200"
                            }`}
                        >
                          {isActive ? (
                            <>Active</>
                          ) : (
                            <>Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {isCurrentSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-[#D97706] border border-amber-300 rounded-full font-semibold text-[11px]">
                            Selected Batch
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <h2 className="text-base font-bold text-[#1E293B]">
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
            <form onSubmit={handleSubmit} className="flex flex-col grow overflow-hidden space-y-4">
              <div className="overflow-y-auto pr-1 space-y-4 text-xs grow">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Start Year *</label>
                    <select
                      required
                      value={formData.start_year}
                      onChange={(e) => handleStartYearChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB] transition-all font-medium cursor-pointer"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#1E293B] text-xs font-bold mb-1">End Year *</label>
                    <select
                      required
                      value={formData.end_year}
                      onChange={(e) => setFormData({ ...formData, end_year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB] transition-all font-medium cursor-pointer"
                    >
                      {yearOptions
                        .filter((y) => y >= parseInt(formData.start_year))
                        .map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                    </select>
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
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0] shrink-0">
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
