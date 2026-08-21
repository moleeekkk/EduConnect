import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, Award, X } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const AdminSubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDeptModal, setSelectedDeptModal] = useState(null);
  const [editSubjectModal, setEditSubjectModal] = useState(null);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    credits: 4,
    type: "Theory",
    semester: 1,
  });

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(4);
  const [newType, setNewType] = useState("Theory");
  const [newSemester, setNewSemester] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [progs, subs] = await Promise.all([
        adminApi.getPrograms(),
        adminApi.getCourses(),
      ]);
      setPrograms(Array.isArray(progs) ? progs : []);
      setSubjects(Array.isArray(subs) ? subs : []);
    } catch (err) {
      console.log("Fetch subjects error:", err);
      setPrograms([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDeptModal = (prog) => {
    setSelectedDeptModal(prog);
    setNewCode("");
    setNewName("");
    setNewCredits(4);
    setNewType("Theory");
    setNewSemester(1);
  };

  const handleAddSubjectToDept = async (e) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    try {
      await adminApi.createCourse({
        code: newCode,
        name: newName,
        credits: parseInt(newCredits) || 4,
        type: newType,
        semester: parseInt(newSemester) || 1,
        program_id: selectedDeptModal ? selectedDeptModal.program_id : null,
      });
      setNewCode("");
      setNewName("");
      setNewCredits(4);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create subject");
    }
  };

  const handleDeleteSubject = async (subjId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await adminApi.deleteCourse(subjId);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete subject");
      }
    }
  };

  const handleOpenEditSubject = (subj, e) => {
    if (e) e.stopPropagation();
    setEditSubjectModal(subj);
    setEditForm({
      code: subj.code || "",
      name: subj.name || "",
      credits: subj.credits || 4,
      type: subj.type || "Theory",
      semester: subj.semester || 1,
    });
  };

  const handleSaveEditSubject = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateCourse(editSubjectModal.subject_id, editForm);
      setEditSubjectModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update subject");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Subject & Curriculum Management</h1>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs col-span-full">
            Loading subjects from database...
          </div>
        ) : programs && programs.length > 0 ? (
          programs.map((prog) => {
            const deptSubjects = subjects.filter((s) => s.program_id === prog.program_id || !s.program_id);
            const totalCredits = deptSubjects.reduce((acc, curr) => acc + (curr.credits || 0), 0);

            return (
              <div
                key={prog.program_id}
                onClick={() => handleOpenDeptModal(prog)}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#2563EB]/40 transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <span className="px-3 py-1 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs">
                      {prog.program_code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-[#2563EB]">
                      {prog.program_name}
                    </h3>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase">Configured Subjects</span>
                      <span className="font-mono font-extrabold text-[#2563EB]">
                        {deptSubjects.length} Subjects
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase">Cumulative Credits</span>
                      <span className="font-extrabold text-[#14B8A6]">{totalCredits} Credits</span>
                    </div>
                  </div>
                </div>

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
          })
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs col-span-full">
            No departments available.
          </div>
        )}
      </div>

      {/* Pop-up Modal */}
      {selectedDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-[#2563EB]">
                  {selectedDeptModal.program_code}
                </span>
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  {selectedDeptModal.program_name} Subjects
                </h3>
              </div>

              <button
                onClick={() => setSelectedDeptModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of subjects */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {subjects && subjects.length > 0 ? (
                subjects.map((s) => (
                  <div key={s.subject_id || s.code} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#2563EB] mr-2">{s.code}</span>
                      <span className="font-bold text-[#1E293B]">{s.name}</span>
                      <span className="text-[10px] text-[#64748B] ml-2 font-mono">({s.credits} Credits • Sem {s.semester})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => handleOpenEditSubject(s, e)} className="p-1 hover:bg-[#14B8A6]/10 rounded text-[#14B8A6]">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteSubject(s.subject_id)} className="p-1 hover:bg-[#EF4444]/10 rounded text-[#EF4444]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748B] italic">No subjects configured yet.</p>
              )}
            </div>

            {/* Add Subject Form */}
            <form onSubmit={handleAddSubjectToDept} className="p-4 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-3 text-xs">
              <h4 className="font-bold text-[#2563EB]">Add New Subject to DB</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input type="text" required value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Subject Code..." className="p-2 rounded-lg border border-[#E2E8F0] bg-white" />
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Subject Name..." className="p-2 rounded-lg border border-[#E2E8F0] bg-white" />
                <input type="number" required value={newCredits} onChange={(e) => setNewCredits(e.target.value)} placeholder="Credits..." className="p-2 rounded-lg border border-[#E2E8F0] bg-white" />
                <input type="number" required value={newSemester} onChange={(e) => setNewSemester(e.target.value)} placeholder="Semester No..." className="p-2 rounded-lg border border-[#E2E8F0] bg-white" />
              </div>
              <Button variant="primary" size="sm" type="submit" className="text-xs">
                Add Subject
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">Edit Subject</h3>
              <button onClick={() => setEditSubjectModal(null)} className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Subject Code</label>
                <input type="text" disabled value={editForm.code} className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Subject Name</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Credits</label>
                <input type="number" required value={editForm.credits} onChange={(e) => setEditForm({ ...editForm, credits: e.target.value })} className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditSubjectModal(null)}>Cancel</Button>
                <Button variant="accent" size="sm" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectManagement;
