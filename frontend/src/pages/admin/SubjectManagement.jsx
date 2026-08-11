import React, { useState } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, Award, Clock, FileText, Layers, CheckCircle2, X, FolderTree } from "lucide-react";
import Button from "../../components/common/Button";
import { mockSubjects, mockPrograms } from "../../data/mockData";

const AdminSubjectManagement = () => {
  const [subjects, setSubjects] = useState(mockSubjects);
  const [programs] = useState(mockPrograms);

  // Selected Department Modal State (Subjects View & Add inside Pop-up)
  const [selectedDeptModal, setSelectedDeptModal] = useState(null);

  // View / Edit Subject Modal States
  const [viewSubject, setViewSubject] = useState(null);
  const [editSubjectModal, setEditSubjectModal] = useState(null);
  const [editForm, setEditForm] = useState({
    subject_code: "",
    subject_name: "",
    credits: 4,
    program_id: "prog-001",
    subject_type: "Core Theory",
    total_hours: 60,
    description: "",
    is_active: true,
  });

  // State for Add Subject Form inside Department Pop-up Modal
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(4);
  const [newType, setNewType] = useState("Core Theory");

  // Open Department Subjects Pop-up Modal
  const handleOpenDeptModal = (prog) => {
    setSelectedDeptModal(prog);
    setNewCode("");
    setNewName("");
    setNewCredits(4);
    setNewType("Core Theory");
  };

  // Add New Subject to Department inside Pop-up Modal
  const handleAddSubjectToDept = (e) => {
    e.preventDefault();
    if (!selectedDeptModal || !newCode || !newName) return;

    const createdSubj = {
      subject_id: `subj-${subjects.length + 105}`,
      program_id: selectedDeptModal.program_id,
      semester_id: "sem-003",
      subject_code: newCode,
      subject_name: newName,
      credits: parseInt(newCredits) || 4,
      subject_type: newType,
      total_hours: 60,
      description: `Comprehensive course covering ${newName} concepts, practical assignments, and modern industry frameworks.`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSubjects([...subjects, createdSubj]);
    setNewCode("");
    setNewName("");
    setNewCredits(4);
  };

  // Delete Subject
  const handleDeleteSubject = (subjId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter((s) => s.subject_id !== subjId));
    }
  };

  // Open Edit Subject Modal
  const handleOpenEditSubject = (subj, e) => {
    if (e) e.stopPropagation();
    setEditSubjectModal(subj);
    setEditForm({
      subject_code: subj.subject_code || "",
      subject_name: subj.subject_name || "",
      credits: subj.credits || 4,
      program_id: subj.program_id || "prog-001",
      subject_type: subj.subject_type || "Core Theory",
      total_hours: subj.total_hours || 60,
      description: subj.description || "",
      is_active: subj.is_active !== undefined ? subj.is_active : true,
    });
  };

  // Save Edited Subject
  const handleSaveEditSubject = (e) => {
    e.preventDefault();
    setSubjects(
      subjects.map((s) =>
        s.subject_id === editSubjectModal.subject_id
          ? { ...s, ...editForm, updated_at: new Date().toISOString() }
          : s
      )
    );
    setEditSubjectModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Subject Management</h1>
        </div>
      </div>

      {/* Listed Department-Wise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((prog) => {
          const deptSubjects = subjects.filter((s) => s.program_id === prog.program_id);
          const totalCredits = deptSubjects.reduce((acc, curr) => acc + (curr.credits || 0), 0);

          return (
            <div
              key={prog.program_id}
              onClick={() => handleOpenDeptModal(prog)}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-200 cursor-pointer group"
            >
              <div className="space-y-3">
                {/* Department Code Pill */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <span className="px-3 py-1 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs border border-[#2563EB]/20">
                    {prog.program_code}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono font-semibold">
                    {prog.duration_years} Years Course
                  </span>
                </div>

                {/* Department Name */}
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-[#2563EB] transition-colors leading-snug">
                    {prog.program_name}
                  </h3>
                </div>

                {/* Outside Card Info: Configured Subjects & Credits */}
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" /> Configured Subjects
                    </span>
                    <span className="font-mono font-extrabold text-[#2563EB]">
                      {deptSubjects.length} Subjects
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#14B8A6]" /> Cumulative Credits
                    </span>
                    <span className="font-extrabold text-[#14B8A6]">{totalCredits} Credits</span>
                  </div>
                </div>
              </div>

              {/* Outside Action Button */}
              <div className="pt-3 border-t border-[#E2E8F0]">
                <Button
                  variant="accent"
                  size="sm"
                  icon={BookOpen}
                  onClick={() => handleOpenDeptModal(prog)}
                  className="w-full text-xs"
                >
                  View & Manage Subjects
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPARTMENT SUBJECTS POP-UP MODAL (View & Add Subjects) */}
      {selectedDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 my-8 animate-fade-in">
            {/* Modal Header with Close Cross Button */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs">
                  {selectedDeptModal.program_code}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B]">
                    {selectedDeptModal.program_name} Subjects
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Total Configured Subjects: {subjects.filter((s) => s.program_id === selectedDeptModal.program_id).length}
                  </p>
                </div>
              </div>

              {/* Close Cross Button */}
              <button
                onClick={() => setSelectedDeptModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Subject to Department Form inside Pop-up Modal */}
            <div className="p-4 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-3">
              <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#2563EB]" /> Add New Subject to {selectedDeptModal.program_code}
              </h4>

              <form onSubmit={handleAddSubjectToDept} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. MCA301"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white font-mono font-bold text-[#2563EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Advanced Web Technology"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newCredits}
                    onChange={(e) => setNewCredits(parseInt(e.target.value) || 4)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject Category / Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white"
                  >
                    <option value="Core Theory">Core Theory</option>
                    <option value="Practical Lab">Practical Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Project / Seminar">Project / Seminar</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button variant="accent" size="sm" type="submit" icon={Plus} className="w-full text-xs !py-2.5">
                    Add Subject
                  </Button>
                </div>
              </form>
            </div>

            {/* Existing Subjects Grid inside Pop-up Modal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Department Subjects ({subjects.filter((s) => s.program_id === selectedDeptModal.program_id).length})
              </h4>

              {subjects.filter((s) => s.program_id === selectedDeptModal.program_id).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
                  {subjects
                    .filter((s) => s.program_id === selectedDeptModal.program_id)
                    .map((subj) => (
                      <div
                        key={subj.subject_id}
                        className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#2563EB]/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono font-bold text-[#2563EB] text-xs bg-[#2563EB]/10 px-2 py-0.5 rounded">
                              {subj.subject_code}
                            </span>
                            <h5 className="text-xs font-extrabold text-[#1E293B] pt-1">{subj.subject_name}</h5>
                          </div>
                          <span className="font-bold text-[#14B8A6] text-xs shrink-0">
                            {subj.credits} Credits
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11px]">
                          <span className="text-[#64748B] font-medium">{subj.subject_type || "Core Theory"}</span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewSubject(subj)}
                              className="p-1 hover:bg-[#2563EB]/10 rounded text-[#2563EB] transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleOpenEditSubject(subj, e)}
                              className="p-1 hover:bg-[#14B8A6]/10 rounded text-[#14B8A6] transition-colors cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subj.subject_id)}
                              className="p-1 hover:bg-[#EF4444]/10 rounded text-[#EF4444] transition-colors cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
                  No subjects added for this department yet. Use the form above to add a subject.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Subject Info Modal */}
      {viewSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2563EB]" /> Subject Details
              </h3>
              <button
                onClick={() => setViewSubject(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#2563EB] font-bold text-xs bg-[#2563EB]/10 px-2.5 py-0.5 rounded">
                    Code: {viewSubject.subject_code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E]">
                    Active Subject
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#1E293B] pt-1">{viewSubject.subject_name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Credits</span>
                  <p className="font-bold text-[#14B8A6]">{viewSubject.credits} Credits</p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Type</span>
                  <p className="font-bold text-[#1E293B]">{viewSubject.subject_type || "Core Theory"}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Syllabus Overview</span>
                <p className="text-[#64748B] leading-relaxed">
                  {viewSubject.description || "Comprehensive subject curriculum covering theoretical principles and practical exercises."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                Edit Subject Details
              </h3>
              <button
                onClick={() => setEditSubjectModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Subject Code</label>
                <input
                  type="text"
                  required
                  value={editForm.subject_code}
                  onChange={(e) => setEditForm({ ...editForm, subject_code: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editForm.subject_name}
                  onChange={(e) => setEditForm({ ...editForm, subject_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={editForm.credits}
                    onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 4 })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject Type</label>
                  <select
                    value={editForm.subject_type}
                    onChange={(e) => setEditForm({ ...editForm, subject_type: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="Core Theory">Core Theory</option>
                    <option value="Practical Lab">Practical Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Project / Seminar">Project / Seminar</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditSubjectModal(null)}>
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
