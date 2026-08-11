import React, { useState } from "react";
import { FolderTree, Plus, Edit, Trash2, BookOpen, Layers, CheckCircle2, AlertCircle, X, GraduationCap, Clock, Calendar } from "lucide-react";
import Button from "../../components/common/Button";
import { mockPrograms, mockSemesters } from "../../data/mockData";

const AdminProgramManagement = () => {
  const [programs, setPrograms] = useState(mockPrograms);
  const [semesters, setSemesters] = useState(mockSemesters);

  // Selected Department for Pop-up Modal (Semesters View & Add)
  const [selectedDeptModal, setSelectedDeptModal] = useState(null);

  // Add / Edit Department Modal State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editProg, setEditProg] = useState(null);
  const [progForm, setProgForm] = useState({
    program_name: "",
    program_code: "",
    duration_years: 2,
  });

  // State for Add Semester Form inside the Department Pop-up Modal
  const [newSemNumber, setNewSemNumber] = useState(1);
  const [newSemName, setNewSemName] = useState("Semester 1");
  const [newSemActive, setNewSemActive] = useState(true);

  // Open Add Department Modal
  const handleOpenAddProg = () => {
    setEditProg(null);
    setProgForm({ program_name: "", program_code: "", duration_years: 2 });
    setShowProgramModal(true);
  };

  // Open Edit Department Modal
  const handleOpenEditProg = (prog, e) => {
    e.stopPropagation();
    setEditProg(prog);
    setProgForm({ ...prog });
    setShowProgramModal(true);
  };

  // Delete Department
  const handleDeleteProg = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this department?")) {
      setPrograms(programs.filter((p) => p.program_id !== id));
      setSemesters(semesters.filter((s) => s.program_id !== id));
      if (selectedDeptModal && selectedDeptModal.program_id === id) {
        setSelectedDeptModal(null);
      }
    }
  };

  // Save Department (Add or Edit)
  const handleSaveProg = (e) => {
    e.preventDefault();
    if (editProg) {
      setPrograms(programs.map((p) => (p.program_id === editProg.program_id ? { ...p, ...progForm } : p)));
    } else {
      const created = {
        program_id: `prog-00${programs.length + 1}`,
        institute_id: "inst-001",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...progForm,
      };
      setPrograms([...programs, created]);
    }
    setShowProgramModal(false);
  };

  // Open Department Semesters Pop-up Modal
  const handleOpenDeptModal = (prog) => {
    setSelectedDeptModal(prog);
    const progSems = semesters.filter((s) => s.program_id === prog.program_id);
    const nextNum = progSems.length + 1;
    setNewSemNumber(nextNum);
    setNewSemName(`Semester ${nextNum}`);
    setNewSemActive(true);
  };

  // Add New Semester inside Department Pop-up Modal
  const handleAddSemesterToDept = (e) => {
    e.preventDefault();
    if (!selectedDeptModal) return;

    const createdSem = {
      semester_id: `sem-00${semesters.length + 1}`,
      program_id: selectedDeptModal.program_id,
      semester_number: parseInt(newSemNumber) || 1,
      semester_name: newSemName || `Semester ${newSemNumber}`,
      is_active: newSemActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSemesters([...semesters, createdSem]);

    // Calculate next semester for quick sequential adding
    const updatedProgSemsCount = semesters.filter((s) => s.program_id === selectedDeptModal.program_id).length + 1;
    const nextNum = updatedProgSemsCount + 1;
    setNewSemNumber(nextNum);
    setNewSemName(`Semester ${nextNum}`);
  };

  // Delete Semester inside Pop-up Modal
  const handleDeleteSem = (semId) => {
    if (window.confirm("Are you sure you want to delete this semester?")) {
      setSemesters(semesters.filter((s) => s.semester_id !== semId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Department</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddProg} className="text-xs">
          Add Department
        </Button>
      </div>

      {/* Listed Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((prog) => {
          const progSemesters = semesters.filter((s) => s.program_id === prog.program_id);
          return (
            <div
              key={prog.program_id}
              onClick={() => handleOpenDeptModal(prog)}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-200 cursor-pointer group"
            >
              <div className="space-y-3">
                {/* Card Header: Code Badge & Actions */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <span className="px-3 py-1 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs border border-[#2563EB]/20">
                    {prog.program_code}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEditProg(prog, e)}
                      className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors cursor-pointer"
                      title="Edit Department"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProg(prog.program_id, e)}
                      className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-[#2563EB] transition-colors leading-snug">
                    {prog.program_name}
                  </h3>
                </div>

                {/* Key Outside Details Box: Duration, Semesters */}
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Course Duration
                    </span>
                    <span className="font-extrabold text-[#1E293B]">{prog.duration_years} Years</span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#14B8A6]" /> Total Semesters
                    </span>
                    <span className="font-mono font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded">
                      {progSemesters.length} Semesters
                    </span>
                  </div>
                </div>
              </div>

              {/* Outside Card Action Button */}
              <div className="pt-3 border-t border-[#E2E8F0]">
                <Button
                  variant="accent"
                  size="sm"
                  icon={Layers}
                  onClick={() => handleOpenDeptModal(prog)}
                  className="w-full text-xs"
                >
                  View Semesters & Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPARTMENT POP-UP MODAL (View & Add Semesters) */}
      {selectedDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 my-8 animate-fade-in">
            {/* Modal Header with Close Cross Button */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs">
                  {selectedDeptModal.program_code}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B]">
                    {selectedDeptModal.program_name}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Duration: {selectedDeptModal.duration_years} Years • Total Configured Semesters: {semesters.filter((s) => s.program_id === selectedDeptModal.program_id).length}
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

            {/* Add New Semester Section inside Pop-up Modal */}
            <div className="p-4 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-3">
              <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#2563EB]" /> Add New Semester to Department
              </h4>

              <form onSubmit={handleAddSemesterToDept} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Semester Number</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={newSemNumber}
                    onChange={(e) => {
                      const num = parseInt(e.target.value) || 1;
                      setNewSemNumber(num);
                      setNewSemName(`Semester ${num}`);
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white font-mono font-bold text-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Semester Name / Label</label>
                  <input
                    type="text"
                    required
                    value={newSemName}
                    onChange={(e) => setNewSemName(e.target.value)}
                    placeholder="e.g. Semester 1"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white"
                  />
                </div>

                <div className="flex items-end">
                  <Button variant="accent" size="sm" type="submit" icon={Plus} className="w-full text-xs !py-2.5">
                    Add Semester
                  </Button>
                </div>
              </form>
            </div>

            {/* Existing Semesters List inside Pop-up Modal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Configured Semesters ({semesters.filter((s) => s.program_id === selectedDeptModal.program_id).length})
              </h4>

              {semesters.filter((s) => s.program_id === selectedDeptModal.program_id).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                  {semesters
                    .filter((s) => s.program_id === selectedDeptModal.program_id)
                    .map((sem) => (
                      <div
                        key={sem.semester_id}
                        className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-3 hover:border-[#2563EB]/30 transition-all"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-[#2563EB] block">
                            Semester {sem.semester_number}
                          </span>
                          <span className="text-xs font-semibold text-[#1E293B]">
                            {sem.semester_name || `Semester ${sem.semester_number}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sem.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {sem.is_active ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => handleDeleteSem(sem.semester_id)}
                            className="p-1 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                            title="Delete Semester"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
                  No semesters configured for this department yet. Use the form above to add a semester.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editProg ? "Edit Department" : "Add New Department"}
              </h3>
              <button
                onClick={() => setShowProgramModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProg} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Department Code</label>
                <input
                  type="text"
                  required
                  value={progForm.program_code}
                  onChange={(e) => setProgForm({ ...progForm, program_code: e.target.value })}
                  placeholder="e.g. MCA, BCA, IT"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Department Name</label>
                <input
                  type="text"
                  required
                  value={progForm.program_name}
                  onChange={(e) => setProgForm({ ...progForm, program_name: e.target.value })}
                  placeholder="e.g. Master of Computer Applications"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Duration in Years</label>
                <input
                  type="number"
                  required
                  value={progForm.duration_years}
                  onChange={(e) => setProgForm({ ...progForm, duration_years: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowProgramModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgramManagement;
