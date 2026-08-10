import React, { useState } from "react";
import { Megaphone, Plus, Edit, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import { mockAnnouncements } from "../../data/mockData";

const AdminAnnouncements = () => {
  const [notices, setNotices] = useState(mockAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [targetRole, setTargetRole] = useState("All Students");

  const handleAddNotice = (e) => {
    e.preventDefault();
    const created = {
      id: notices.length + 1,
      title,
      description: desc,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      target_role: targetRole,
      created_by: "Super Admin",
    };

    setNotices([created, ...notices]);
    setShowModal(false);
    setTitle("");
    setDesc("");
  };

  const handleDelete = (id) => {
    if (confirm("Delete announcement?")) {
      setNotices(notices.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Campus Announcements & Notices</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Add, Update, Delete, and View institutional announcements</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={() => setShowModal(true)} className="text-xs">
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex items-start justify-between gap-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[10px]">
                  {n.target_role}
                </span>
                <span className="font-mono text-[#64748B]">{n.date}</span>
              </div>
              <h3 className="text-sm font-bold text-[#1E293B]">{n.title}</h3>
              <p className="text-[#64748B]">{n.description}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(n.id)}
              className="text-xs text-[#EF4444] border-[#EF4444]/30 shrink-0"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Add Campus Notice
            </h3>

            <form onSubmit={handleAddNotice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1">Notice Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mid-Term Examination Schedule" className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Target Audience</label>
                <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <option value="All Students">All Students</option>
                  <option value="Faculty Only">Faculty Only</option>
                  <option value="Students & Teachers">Students & Teachers</option>
                </select>
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Notice Content</label>
                <textarea rows={3} required value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="accent" size="sm" type="submit">Publish Notice</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
