import React, { useState } from "react";
import { Plus, Edit, Trash2, Layers, X, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { mockPrograms, mockSemesters } from "../../data/mockData";

const AdminProgramManagement = () => {
  const [programs, setPrograms] = useState(mockPrograms || []);
  const [semesters, setSemesters] = useState(mockSemesters || []);

  const [selectedDeptModal, setSelectedDeptModal] = useState(null);

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editProg, setEditProg] = useState(null);
  const [progForm, setProgForm] = useState({
    program_name: "",
    program_code: "",
    duration_years: 2,
  });

  const [newSemNumber, setNewSemNumber] = useState(1);
  const [newSemName, setNewSemName] = useState("Semester 1");
  const [newSemActive, setNewSemActive] = useState(true);

  const handleOpenAddProg = () => {
    setEditProg(null);
    setProgForm({ program_name: "", program_code: "", duration_years: 2 });
    setShowProgramModal(true);
  };

  const handleOpenEditProg = (prog, e) => {
    e.stopPropagation();
    setEditProg(prog);
    setProgForm({ ...prog });
    setShowProgramModal(true);
  };

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

  const handleSaveProg = (e) => {
    e.preventDefault();
    if (editProg) {
      setPrograms(programs.map((p) => (p.program_id === editProg.program_id ? { ...p, ...progForm } : p)));
    } else {
      const created = {
        program_id: `prog-${Date.now()}`,
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

  const handleOpenDeptModal = (prog) => {
    setSelectedDeptModal(prog);
    const progSems = semesters.filter((s) => s.program_id === prog.program_id);
    const nextNum = progSems.length + 1;
    setNewSemNumber(nextNum);
    setNewSemName(`Semester ${nextNum}`);
    setNewSemActive(true);
  };

  const handleAddSemesterToDept = (e) => {
    e.preventDefault();
    if (!selectedDeptModal) return;

    const createdSem = {
      semester_id: `sem-${Date.now()}`,
      program_id: selectedDeptModal.program_id,
      semester_number: parseInt(newSemNumber) || 1,
      semester_name: newSemName || `Semester ${newSemNumber}`,
      is_active: newSemActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSemesters([...semesters, createdSem]);

    const updatedProgSemsCount = semesters.filter((s) => s.program_id === selectedDeptModal.program_id).length + 1;
    const nextNum = updatedProgSemsCount + 1;
    setNewSemNumber(nextNum);
    setNewSemName(`Semester ${nextNum}`);
  };

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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs && programs.length > 0 ? (
          programs.map((prog) => {
            const progSemesters = semesters.filter((s) => s.program_id === prog.program_id);
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

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEditProg(prog, e)}
                        className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6]"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProg(prog.program_id, e)}
                        className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-[#2563EB]">
                      {prog.program_name}
                    </h3>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase">Course Duration</span>
                      <span className="font-extrabold text-[#1E293B]">{prog.duration_years} Years</span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase">Total Semesters</span>
                      <span className="font-mono font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded">
                        {progSemesters.length} Semesters
                      </span>
                    </div>
                  </div>
                </div>

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
          })
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs col-span-full">
            No departments found.
          </div>
        )}
      </div>

      {/* Pop-up Modal */}
      {selectedDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-[#2563EB]">
                  {selectedDeptModal.program_code}
                </span>
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  {selectedDeptModal.program_name}
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

      {/* Add/Edit Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editProg ? "Edit Department" : "Add New Department"}
              </h3>
              <button
                onClick={() => setShowProgramModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 cursor-pointer"
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
                  placeholder="e.g. Code..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Department Name</label>
                <input
                  type="text"
                  required
                  value={progForm.program_name}
                  onChange={(e) => setProgForm({ ...progForm, program_name: e.target.value })}
                  placeholder="e.g. Name..."
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
