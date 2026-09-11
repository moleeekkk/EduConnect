import React, { useState, useEffect } from "react";
import { Bell, Plus, Edit2, Archive, AlertCircle, RefreshCw, CheckCircle, Calendar, Users, Filter, X } from "lucide-react";
import { teacherApi } from "../../services/api";

const TeacherNotices = () => {
  const [notices, setNotices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_role: "COHORT",
    department_id: "",
    batch_id: "",
    expiry_date: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nRes, dRes, bRes] = await Promise.all([
        teacherApi.getNotices().catch(() => []),
        teacherApi.getDepartments().catch(() => []),
        teacherApi.getBatches().catch(() => []),
      ]);
      setNotices(Array.isArray(nRes) ? nRes : []);
      setDepartments(Array.isArray(dRes) ? dRes : []);
      setBatches(Array.isArray(bRes) ? bRes : []);
    } catch (err) {
      console.error("Failed to load notices:", err);
      setError("Failed to load notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingNotice(null);
    setForm({
      title: "",
      description: "",
      target_role: "COHORT",
      department_id: departments[0]?.department_id || "",
      batch_id: batches[0]?.batch_id || "",
      expiry_date: "",
    });
    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || "",
      description: notice.description || "",
      target_role: notice.target_role || "COHORT",
      department_id: notice.department_id || "",
      batch_id: notice.batch_id || "",
      expiry_date: notice.expiry_date ? notice.expiry_date.substring(0, 10) : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        targetRole: form.target_role,
        departmentId: form.department_id || null,
        batchId: form.batch_id || null,
        expiryDate: form.expiry_date ? `${form.expiry_date}T23:59:59` : null,
      };

      if (editingNotice) {
        await teacherApi.updateNotice(editingNotice.id || editingNotice.notice_id, payload);
        setSuccess("Notice updated successfully!");
      } else {
        await teacherApi.createNotice(payload);
        setSuccess("Notice published successfully!");
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Notice save error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to publish notice. Teachers can only target allocated cohorts.";
      setError(errMsg);
    }
  };

  const handleArchive = async (noticeId) => {
    if (!window.confirm("Are you sure you want to archive this notice?")) return;
    try {
      setError(null);
      await teacherApi.archiveNotice(noticeId);
      setSuccess("Notice archived.");
      fetchData();
    } catch (err) {
      console.error("Archive error:", err);
      setError("Failed to archive notice.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#64748B]">Loading notice board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notice Board & Announcements
          </h1>
          <p className="text-white/80 text-xs mt-1">
            Publish targeted cohort notices and announcements for your allocated students.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-white text-[#2563EB] hover:bg-white/90 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Notice
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Notice Feed */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h2 className="text-base font-bold text-[#1E293B]">Active Announcements ({notices.length})</h2>
          <button onClick={fetchData} className="p-1.5 text-[#64748B] hover:text-[#2563EB] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-12 text-[#64748B] space-y-2">
            <Bell className="w-10 h-10 mx-auto text-[#94A3B8]" />
            <p className="text-sm font-medium">No notices published yet.</p>
            <p className="text-xs text-[#94A3B8]">Click "Create Notice" to publish your first cohort announcement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((notice) => {
              const id = notice.id || notice.notice_id;
              const isArchived = Boolean(notice.is_archived);
              return (
                <div
                  key={id}
                  className={`p-4 rounded-xl border transition-all ${
                    isArchived
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#2563EB]/40"
                  } space-y-3 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold uppercase">
                        {notice.target_role || "COHORT"}
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono">{notice.date || notice.publish_date?.substring(0, 10)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1E293B]">{notice.title}</h3>
                    <p className="text-xs text-[#475569] whitespace-pre-line leading-relaxed">{notice.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>Author: <strong className="font-semibold text-[#1E293B]">{notice.author_name || "Teacher"}</strong></span>
                    <div className="flex items-center gap-2">
                      {!isArchived && (
                        <>
                          <button
                            onClick={() => openEditModal(notice)}
                            className="p-1 text-[#2563EB] hover:bg-[#2563EB]/10 rounded transition-colors"
                            title="Edit Notice"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Archive Notice"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Notice */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#1E293B] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#2563EB]" />
              {editingNotice ? "Edit Notice" : "Publish Cohort Notice"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#1E293B] uppercase mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Project Submission Guidelines"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1E293B] uppercase mb-1">Description / Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter notice details, instructions, or cohort updates..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1E293B] uppercase mb-1">Target Department</label>
                  <select
                    value={form.department_id}
                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  >
                    <option value="">All Allocated Depts</option>
                    {departments.map((d) => (
                      <option key={d.department_id || d.id} value={d.department_id || d.id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1E293B] uppercase mb-1">Target Batch</label>
                  <select
                    value={form.batch_id}
                    onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  >
                    <option value="">All Allocated Batches</option>
                    {batches.map((b) => (
                      <option key={b.batch_id || b.id} value={b.batch_id || b.id}>
                        {b.batch_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1E293B] uppercase mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
                <p className="text-[10px] text-[#64748B] mt-0.5">Notice will automatically hide from readers after expiry date.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#64748B] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg transition-colors"
                >
                  {editingNotice ? "Update Notice" : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherNotices;
