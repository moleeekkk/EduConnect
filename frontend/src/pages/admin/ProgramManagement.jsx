import React, { useState } from "react";
import { FolderTree, Plus, Edit, Trash2, BookOpen, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../../components/common/Button";
import { mockPrograms, mockSemesters } from "../../data/mockData";

const AdminProgramManagement = () => {
  const [programs, setPrograms] = useState(mockPrograms);
  const [semesters, setSemesters] = useState(mockSemesters);

  // Program Modal State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editProg, setEditProg] = useState(null);
  const [progForm, setProgForm] = useState({
    program_name: "",
    program_code: "",
    duration_years: 2,
  });

  // Semester Modal State (Department-wise)
  const [showSemModal, setShowSemModal] = useState(false);
  const [editSem, setEditSem] = useState(null);
  const [semForm, setSemForm] = useState({
    program_id: mockPrograms[0]?.program_id || "prog-001",
    semester_number: 1,
    semester_name: "Semester 1",
    is_active: true,
  });

  // Program Handlers
  const handleOpenAddProg = () => {
    setEditProg(null);
    setProgForm({ program_name: "", program_code: "", duration_years: 2 });
    setShowProgramModal(true);
  };

  const handleOpenEditProg = (prog) => {
    setEditProg(prog);
    setProgForm({ ...prog });
    setShowProgramModal(true);
  };

  const handleDeleteProg = (id) => {
    if (window.confirm("Are you sure you want to delete this department/program?")) {
      setPrograms(programs.filter((p) => p.program_id !== id));
      // Also remove associated semesters
      setSemesters(semesters.filter((s) => s.program_id !== id));
    }
  };

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

  // Semester Handlers (Department-Wise)
  const handleOpenAddSem = (targetProgramId = null) => {
    setEditSem(null);
    const defaultProgId = targetProgramId || (programs[0] ? programs[0].program_id : "prog-001");
    // calculate next semester number for this program
    const progSems = semesters.filter((s) => s.program_id === defaultProgId);
    const nextSemNum = progSems.length + 1;
    setSemForm({
      program_id: defaultProgId,
      semester_number: nextSemNum,
      semester_name: `Semester ${nextSemNum}`,
      is_active: true,
    });
    setShowSemModal(true);
  };

  const handleOpenEditSem = (sem) => {
    setEditSem(sem);
    setSemForm({
      program_id: sem.program_id,
      semester_number: sem.semester_number,
      semester_name: sem.semester_name || `Semester ${sem.semester_number}`,
      is_active: sem.is_active !== undefined ? sem.is_active : true,
    });
    setShowSemModal(true);
  };

  const handleDeleteSem = (id) => {
    if (window.confirm("Are you sure you want to delete this semester from the department?")) {
      setSemesters(semesters.filter((s) => s.semester_id !== id));
    }
  };

  const handleSaveSem = (e) => {
    e.preventDefault();
    if (editSem) {
      setSemesters(
        semesters.map((s) => (s.semester_id === editSem.semester_id ? { ...s, ...semForm, updated_at: new Date().toISOString() } : s))
      );
    } else {
      const created = {
        semester_id: `sem-00${semesters.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...semForm,
      };
      setSemesters([...semesters, created]);
    }
    setShowSemModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Department & Semester Management</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Configure degree departments and manage academic semesters department-wise</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={Layers} onClick={() => handleOpenAddSem()} className="text-xs">
            Add Semester (Department-Wise)
          </Button>
          <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddProg} className="text-xs">
            Add Department / Program
          </Button>
        </div>
      </div>

      {/* Department-Wise Cards & Semesters */}
      <div className="space-y-6">
        {programs.map((prog) => {
          const progSemesters = semesters.filter((s) => s.program_id === prog.program_id);
          return (
            <div key={prog.program_id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              {/* Department Header Bar */}
              <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-sm">
                    {prog.program_code}
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#1E293B]">{prog.program_name}</h2>
                    <p className="text-[11px] text-[#64748B]">
                      Duration: <strong className="text-[#1E293B]">{prog.duration_years} Years</strong> • Total Configured Semesters: <strong className="text-[#2563EB]">{progSemesters.length}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Plus}
                    onClick={() => handleOpenAddSem(prog.program_id)}
                    className="text-xs"
                  >
                    Add Semester
                  </Button>
                  <button
                    onClick={() => handleOpenEditProg(prog)}
                    className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors"
                    title="Edit Department"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProg(prog.program_id)}
                    className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Department Semesters Table */}
              <div className="p-4">
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
                  Department Semesters ({progSemesters.length})
                </h3>

                {progSemesters.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                        <tr>
                          <th className="p-3">Semester Number</th>
                          <th className="p-3">Semester Label / Name</th>
                          <th className="p-3">Department Code</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                        {progSemesters.map((sem) => (
                          <tr key={sem.semester_id} className="hover:bg-[#F8FAFC]">
                            <td className="p-3 font-mono font-bold text-[#2563EB]">Semester {sem.semester_number}</td>
                            <td className="p-3 font-semibold">{sem.semester_name || `Semester ${sem.semester_number}`}</td>
                            <td className="p-3 font-mono text-[#64748B]">{prog.program_code}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sem.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                                {sem.is_active ? "Active Semester" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditSem(sem)}
                                className="p-1 hover:bg-[#14B8A6]/10 rounded text-[#14B8A6] transition-colors"
                                title="Edit Semester"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSem(sem.semester_id)}
                                className="p-1 hover:bg-[#EF4444]/10 rounded text-[#EF4444] transition-colors"
                                title="Delete Semester"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                    No semesters added for this department yet. Click <strong>"+ Add Semester"</strong> to create one.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editProg ? "Edit Department / Program" : "Add New Department / Program"}
            </h3>

            <form onSubmit={handleSaveProg} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Department Code (program_code)</label>
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
                <label className="block text-[#64748B] mb-1 font-semibold">Department Name (program_name)</label>
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
                <label className="block text-[#64748B] mb-1 font-semibold">Duration in Years (duration_years)</label>
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

      {/* Add / Edit Semester Modal (Department-Wise) */}
      {showSemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editSem ? "Edit Semester Record" : "Add New Semester Department-Wise"}
            </h3>

            <form onSubmit={handleSaveSem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Select Department / Program</label>
                <select
                  value={semForm.program_id}
                  onChange={(e) => setSemForm({ ...semForm, program_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#2563EB]"
                >
                  {programs.map((p) => (
                    <option key={p.program_id} value={p.program_id}>
                      {p.program_name} ({p.program_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Semester Number (semester_number)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={semForm.semester_number}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 1;
                    setSemForm({ ...semForm, semester_number: num, semester_name: `Semester ${num}` });
                  }}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Semester Label / Name (semester_name)</label>
                <input
                  type="text"
                  required
                  value={semForm.semester_name}
                  onChange={(e) => setSemForm({ ...semForm, semester_name: e.target.value })}
                  placeholder="e.g. Semester 1 (Monsoon 2026)"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sem_active"
                  checked={semForm.is_active}
                  onChange={(e) => setSemForm({ ...semForm, is_active: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="sem_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                  Active Semester Status (is_active)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowSemModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Semester
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
