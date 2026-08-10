import React, { useState } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, Award, Clock, FileText, Layers, CheckCircle2 } from "lucide-react";
import Button from "../../components/common/Button";
import { mockSubjects, mockPrograms, mockSemesters } from "../../data/mockData";

const AdminSubjectManagement = () => {
  const [subjects, setSubjects] = useState(mockSubjects);

  // Modal States
  const [viewSubject, setViewSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState({
    subject_code: "",
    subject_name: "",
    credits: 4,
    program_id: "prog-001",
    semester_id: "sem-003",
    subject_type: "Core Theory",
    total_hours: 60,
    description: "",
    is_active: true,
  });

  const handleOpenAdd = () => {
    setEditSubject(null);
    setForm({
      subject_code: "",
      subject_name: "",
      credits: 4,
      program_id: mockPrograms[0]?.program_id || "prog-001",
      semester_id: "sem-003",
      subject_type: "Core Theory",
      total_hours: 60,
      description: "Advanced curriculum covering core concepts, practical lab exercises, and modern industry applications.",
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (subj) => {
    setEditSubject(subj);
    setForm({
      subject_code: subj.subject_code || "",
      subject_name: subj.subject_name || "",
      credits: subj.credits || 4,
      program_id: subj.program_id || "prog-001",
      semester_id: subj.semester_id || "sem-003",
      subject_type: subj.subject_type || "Core Theory",
      total_hours: subj.total_hours || 60,
      description: subj.description || "Advanced curriculum covering core concepts, practical lab exercises, and modern industry applications.",
      is_active: subj.is_active !== undefined ? subj.is_active : true,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter((s) => s.subject_id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editSubject) {
      setSubjects(
        subjects.map((s) => (s.subject_id === editSubject.subject_id ? { ...s, ...form, updated_at: new Date().toISOString() } : s))
      );
    } else {
      const created = {
        subject_id: `subj-${subjects.length + 105}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...form,
      };
      setSubjects([...subjects, created]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Subject Management (subjects Table)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Admin control center to view details, add, edit all subject information, and delete subjects</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAdd} className="text-xs">
          Add New Subject
        </Button>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Subject Code (subject_code)</th>
                <th className="p-3.5">Subject Name (subject_name)</th>
                <th className="p-3.5">Credits (credits)</th>
                <th className="p-3.5">Subject Type</th>
                <th className="p-3.5">Status (is_active)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {subjects.map((subj) => (
                <tr key={subj.subject_id} className="hover:bg-[#F8FAFC]">
                  <td className="p-3.5 font-mono font-bold text-[#2563EB]">{subj.subject_code}</td>
                  <td className="p-3.5 font-semibold">{subj.subject_name}</td>
                  <td className="p-3.5 font-bold text-[#14B8A6]">{subj.credits} Credits</td>
                  <td className="p-3.5 font-medium text-[#64748B]">{subj.subject_type || "Core Theory"}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${subj.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                      {subj.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 shrink-0">
                    <button
                      onClick={() => setViewSubject(subj)}
                      className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors"
                      title="View Subject Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(subj)}
                      className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors"
                      title="Edit Full Info"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subj.subject_id)}
                      className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors"
                      title="Delete Subject"
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

      {/* View Subject Details Modal */}
      {viewSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2563EB]" /> Complete Subject Information
              </h3>
              <Button variant="outline" size="sm" onClick={() => setViewSubject(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#2563EB] font-bold text-xs bg-[#2563EB]/10 px-2.5 py-0.5 rounded">
                    Code: {viewSubject.subject_code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewSubject.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                    {viewSubject.is_active ? "Active Subject" : "Inactive"}
                  </span>
                </div>
                <h4 className="text-lg font-extrabold text-[#1E293B] pt-1">{viewSubject.subject_name}</h4>
                <p className="text-xs text-[#64748B] font-mono">Subject ID: {viewSubject.subject_id}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Academic Credits</span>
                  <p className="font-bold text-[#14B8A6] text-sm">{viewSubject.credits || 4} Credits</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Subject Category / Type</span>
                  <p className="font-bold text-[#1E293B]">{viewSubject.subject_type || "Core Theory"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Department & Semester</span>
                  <p className="font-medium text-[#2563EB]">Master of Computer Applications (MCA) • Semester 3</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Total Teaching Hours</span>
                  <p className="font-mono text-[#1E293B] font-bold">{viewSubject.total_hours || 60} Hours</p>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Syllabus Overview & Description</span>
                <p className="font-medium text-[#1E293B] leading-relaxed">
                  {viewSubject.description || "Advanced curriculum covering core concepts, practical lab exercises, and modern industry applications."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editSubject ? "Edit Complete Subject Information" : "Add New Course Subject"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject Code (subject_code)</label>
                  <input
                    type="text"
                    required
                    value={form.subject_code}
                    onChange={(e) => setForm({ ...form, subject_code: e.target.value })}
                    placeholder="e.g. MCA301"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject Name (subject_name)</label>
                  <input
                    type="text"
                    required
                    value={form.subject_name}
                    onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
                    placeholder="e.g. Advanced Web Tech"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Academic Credits (credits)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 4 })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Total Hours (total_hours)</label>
                  <input
                    type="number"
                    required
                    value={form.total_hours}
                    onChange={(e) => setForm({ ...form, total_hours: parseInt(e.target.value) || 60 })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Department / Program</label>
                  <select
                    value={form.program_id}
                    onChange={(e) => setForm({ ...form, program_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#2563EB]"
                  >
                    {mockPrograms.map((p) => (
                      <option key={p.program_id} value={p.program_id}>
                        {p.program_name} ({p.program_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject Type</label>
                  <select
                    value={form.subject_type}
                    onChange={(e) => setForm({ ...form, subject_type: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="Core Theory">Core Theory</option>
                    <option value="Practical Lab">Practical Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Project / Seminar">Project / Seminar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Syllabus Overview & Description (description)</label>
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
                  id="subj_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="subj_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                  Subject Active Status (is_active)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectManagement;
