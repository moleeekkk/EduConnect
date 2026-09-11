import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, Clock, MapPin, Edit, Archive, X, User, BookOpen, Layers } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const AdminTimetableManagement = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lookups
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [formData, setFormData] = useState({
    department_id: "",
    semester_id: "",
    batch_id: "",
    subject_id: "",
    teacher_id: "",
    weekday: "Monday",
    start_time: "09:30",
    end_time: "11:00",
    room: "",
    effective_from: new Date().toISOString().split("T")[0],
    effective_to: "2099-12-31",
  });

  // Filter
  const [selectedDayFilter, setSelectedDayFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ttData, deptData, semData, batchData, subData, facData] = await Promise.all([
        adminApi.getTimetables(),
        adminApi.getDepartments(),
        adminApi.getSemesters(),
        adminApi.getBatches(),
        adminApi.getSubjects(),
        adminApi.getFaculty(),
      ]);

      setTimetables(Array.isArray(ttData) ? ttData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setSemesters(Array.isArray(semData) ? semData : []);
      setBatches(Array.isArray(batchData) ? batchData : []);
      setSubjects(Array.isArray(subData) ? subData : []);
      setFacultyList(Array.isArray(facData) ? facData : []);
    } catch (err) {
      console.error("Error loading timetable data:", err);
      notifyError("Failed to load timetable management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setSelectedEntry(null);
    setFormData({
      department_id: departments[0]?.department_id || departments[0]?.id || "",
      semester_id: semesters[0]?.semester_id || semesters[0]?.id || "",
      batch_id: batches[0]?.batch_id || batches[0]?.id || "",
      subject_id: subjects[0]?.subject_id || subjects[0]?.id || "",
      teacher_id: facultyList[0]?.teacher_id || facultyList[0]?.id || "",
      weekday: "Monday",
      start_time: "09:30",
      end_time: "11:00",
      room: "Lab 101",
      effective_from: new Date().toISOString().split("T")[0],
      effective_to: "2099-12-31",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      department_id: entry.department_id || "",
      semester_id: entry.semester_id || "",
      batch_id: entry.batch_id || "",
      subject_id: entry.subject_id || "",
      teacher_id: entry.teacher_id || "",
      weekday: entry.weekday || "Monday",
      start_time: entry.start_time ? entry.start_time.substring(0, 5) : "09:30",
      end_time: entry.end_time ? entry.end_time.substring(0, 5) : "11:00",
      room: entry.room || "",
      effective_from: entry.effective_from || new Date().toISOString().split("T")[0],
      effective_to: entry.effective_to || "2099-12-31",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEntry) {
        const id = selectedEntry.timetable_id || selectedEntry.id;
        await adminApi.updateTimetable(id, formData);
        notifySuccess("Timetable entry updated successfully!");
      } else {
        await adminApi.createTimetable(formData);
        notifySuccess("Timetable slot created successfully!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save timetable error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save timetable slot.";
      notifyError(msg);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this timetable slot?")) return;
    try {
      await adminApi.archiveTimetable(id);
      notifySuccess("Timetable slot archived.");
      fetchData();
    } catch (err) {
      console.error("Archive error:", err);
      notifyError("Failed to archive timetable slot.");
    }
  };

  const filteredTimetables = timetables.filter((t) => {
    const matchesDay = selectedDayFilter === "ALL" || (t.weekday || "").toUpperCase() === selectedDayFilter.toUpperCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      (t.subject_name || "").toLowerCase().includes(query) ||
      (t.teacher_name || "").toLowerCase().includes(query) ||
      (t.room || "").toLowerCase().includes(query) ||
      (t.batch_name || "").toLowerCase().includes(query);
    return matchesDay && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Timetable Management</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Author and manage institutional class schedules and room allocations</p>
        </div>
        <Button variant="accent" size="sm" onClick={openCreateModal} className="flex items-center gap-1.5 text-xs">
          <Plus className="w-4 h-4" /> Add Schedule Slot
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#64748B]">Weekday:</span>
          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            className="p-2 rounded-lg border border-[#E2E8F0] text-xs bg-[#F8FAFC]"
          >
            <option value="ALL">All Days</option>
            {weekdays.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="Search subject, teacher, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-8 rounded-lg border border-[#E2E8F0] text-xs bg-[#F8FAFC]"
          />
          <Search className="w-4 h-4 text-[#64748B] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Scheduled Class Slots</h2>
          <span className="text-xs text-[#64748B] font-mono">Total: {filteredTimetables.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Subject & Code</th>
                <th className="p-3.5">Assigned Faculty</th>
                <th className="p-3.5">Batch / Cohort</th>
                <th className="p-3.5">Day & Time</th>
                <th className="p-3.5">Room</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#64748B]">Loading schedules...</td>
                </tr>
              ) : filteredTimetables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#64748B]">No timetable slots found matching criteria.</td>
                </tr>
              ) : (
                filteredTimetables.map((t) => (
                  <tr key={t.timetable_id || t.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#1E293B]">{t.subject_name}</div>
                      <span className="font-mono text-[10px] text-[#2563EB] font-bold">{t.subject_code}</span>
                    </td>
                    <td className="p-3.5 font-medium text-[#1E293B]">{t.teacher_name}</td>
                    <td className="p-3.5">
                      <span className="font-medium text-[#1E293B]">{t.batch_name}</span>
                      <div className="text-[10px] text-[#64748B]">{t.semester_name}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#2563EB]">{t.weekday}</span>
                      <div className="font-mono text-[11px] text-[#64748B]">{t.time || `${t.start_time} - ${t.end_time}`}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full text-[11px]">
                        {t.room}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-slate-100 text-[#64748B]"
                      }`}>
                        {t.is_active ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {t.is_active && (
                        <>
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Slot"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(t.timetable_id || t.id)}
                            className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-md transition-colors"
                            title="Archive Slot"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {selectedEntry ? "Edit Timetable Slot" : "Create Timetable Slot"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Department *</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.department_id || d.id} value={d.department_id || d.id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Semester *</label>
                  <select
                    value={formData.semester_id}
                    onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((s) => (
                      <option key={s.semester_id || s.id} value={s.semester_id || s.id}>
                        {s.semester_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Batch / Cohort *</label>
                  <select
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                      <option key={b.batch_id || b.id} value={b.batch_id || b.id}>
                        {b.batch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Subject *</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.subject_id || sub.id} value={sub.subject_id || sub.id}>
                        {sub.subject_name} ({sub.subject_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Assigned Faculty / Teacher *</label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((f) => (
                    <option key={f.teacher_id || f.id} value={f.teacher_id || f.id}>
                      {f.first_name || f.firstName} {f.last_name || f.lastName} ({f.employee_id || f.employeeId || "Faculty"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Weekday *</label>
                  <select
                    value={formData.weekday}
                    onChange={(e) => setFormData({ ...formData, weekday: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    {weekdays.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Room / Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 302, Hall A"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Effective From</label>
                  <input
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Effective To</label>
                  <input
                    type="date"
                    value={formData.effective_to}
                    onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  {selectedEntry ? "Update Slot" : "Save Slot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimetableManagement;
