import React, { useState } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, Award, X } from "lucide-react";
import Button from "../../components/common/Button";
import { mockSubjects, mockPrograms } from "../../data/mockData";

const AdminSubjectManagement = () => {
  const [subjects, setSubjects] = useState(mockSubjects || []);
  const [programs] = useState(mockPrograms || []);

  const [selectedDeptModal, setSelectedDeptModal] = useState(null);
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

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(4);
  const [newType, setNewType] = useState("Core Theory");

  const handleOpenDeptModal = (prog) => {
    setSelectedDeptModal(prog);
    setNewCode("");
    setNewName("");
    setNewCredits(4);
    setNewType("Core Theory");
  };

  const handleAddSubjectToDept = (e) => {
    e.preventDefault();
    if (!selectedDeptModal || !newCode || !newName) return;

    const createdSubj = {
      subject_id: `subj-${Date.now()}`,
      program_id: selectedDeptModal.program_id,
      semester_id: "sem-001",
      subject_code: newCode,
      subject_name: newName,
      credits: parseInt(newCredits) || 4,
      subject_type: newType,
      total_hours: 60,
      description: "",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSubjects([...subjects, createdSubj]);
    setNewCode("");
    setNewName("");
    setNewCredits(4);
  };

  const handleDeleteSubject = (subjId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter((s) => s.subject_id !== subjId));
    }
  };

  const handleOpenEditSubject = (subj, e) => {
    if (e) e.stopPropagation();
    setEditSubjectModal(subj);
    setEditForm({ ...subj });
  };

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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs && programs.length > 0 ? (
          programs.map((prog) => {
            const deptSubjects = subjects.filter((s) => s.program_id === prog.program_id);
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectManagement;
