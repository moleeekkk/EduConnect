import React, { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Eye, CheckCircle2, X, GraduationCap } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await teacherApi.getStudents();
        if (Array.isArray(data)) {
          setStudents(data);
        }
      } catch (err) {
        console.error("Teacher students load error:", err);
      }
    };
    fetchStudents();
  }, []);
  const [form, setForm] = useState({
    enrollment_no: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "",
    address: "",
    blood_group: "",
    parent_name: "",
    parent_mobile: "",
    admission_date: "",
  });

  const handleOpenAdd = () => {
    setEditStudent(null);
    setForm({
      enrollment_no: `25CI21100${students.length + 18}`,
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "2003-01-01",
      address: "",
      blood_group: "O+",
      parent_name: "",
      parent_mobile: "",
      admission_date: "2025-07-20",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (stu) => {
    setEditStudent(stu);
    setForm({ ...stu });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const target = students.find((s) => s.student_id === id);
    const name = target ? `${target.first_name} ${target.last_name}` : "student record";
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setStudents(students.filter((s) => s.student_id !== id));
      notifySuccess(`Student '${name}' deleted successfully!`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editStudent) {
      setStudents(students.map((s) => (s.student_id === editStudent.student_id ? { ...s, ...form } : s)));
      notifySuccess(`Student '${form.first_name} ${form.last_name}' updated successfully!`);
    } else {
      const created = {
        student_id: `stu-00${students.length + 1}`,
        batch_id: "batch-001",
        semester_id: "sem-003",
        profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...form,
      };
      setStudents([...students, created]);
      notifySuccess(`Student '${form.first_name} ${form.last_name}' added successfully to database!`);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Student Management</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAdd} className="text-xs">
          Add New Student
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Enrollment No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5">Parent Info</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {students.map((stu) => (
                <tr key={stu.student_id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#2563EB]">{stu.enrollment_no}</td>
                  <td className="p-3.5 font-bold text-[#1E293B]">
                    {stu.first_name} {stu.last_name}
                  </td>
                  <td className="p-3.5 text-[#64748B]">{stu.email}</td>
                  <td className="p-3.5 font-mono font-medium">{stu.mobile}</td>
                  <td className="p-3.5">{stu.gender}</td>
                  <td className="p-3.5 text-[#64748B]">{stu.parent_name} ({stu.parent_mobile})</td>
                  <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                    <button onClick={() => setViewStudent(stu)} className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors" title="View Full Profile">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenEdit(stu)} className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors" title="Edit Student">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(stu.student_id)} className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors" title="Delete Student">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Student Profile Details Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2563EB]" /> Official Student Profile Details
              </h3>
              <button
                onClick={() => setViewStudent(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Student Header Card */}
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <img
                  src={viewStudent.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={viewStudent.first_name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] shadow-2xs"
                />
                <div>
                  <h4 className="text-base font-extrabold text-[#1E293B]">
                    {viewStudent.first_name} {viewStudent.last_name}
                  </h4>
                  <p className="font-mono text-[#2563EB] font-bold text-xs">
                    Enrollment No: {viewStudent.enrollment_no}
                  </p>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">
                    Master of Computer Applications (MCA) • Semester 3 • Active Student
                  </p>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Email Address</span>
                  <p className="font-medium text-[#1E293B] truncate">{viewStudent.email}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Mobile Number</span>
                  <p className="font-mono text-[#1E293B] font-bold">{viewStudent.mobile}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Gender & Date of Birth</span>
                  <p className="font-medium text-[#1E293B]">{viewStudent.gender} • {viewStudent.date_of_birth}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Blood Group & Admission Date</span>
                  <p className="font-medium text-[#1E293B]">Blood Group: {viewStudent.blood_group || "O+"} • Adm: {viewStudent.admission_date || "2025-07-15"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Parent / Guardian Information</span>
                  <p className="font-bold text-[#1E293B]">{viewStudent.parent_name || "Parent Name"}</p>
                  <p className="font-mono text-[#14B8A6] font-bold">{viewStudent.parent_mobile} • {viewStudent.parent_email || "parent@gmail.com"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Residential Address</span>
                  <p className="font-medium text-[#1E293B]">{viewStudent.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editStudent ? "Update Student Record" : "Add New Student Record"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1">Enrollment No (enrollment_no)</label>
                <input type="text" required value={form.enrollment_no} onChange={(e) => setForm({ ...form, enrollment_no: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">First Name (first_name)</label>
                <input type="text" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Last Name (last_name)</label>
                <input type="text" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Email (email)</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Mobile (mobile)</label>
                <input type="text" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Gender (gender)</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Date of Birth (date_of_birth)</label>
                <input type="date" required value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Blood Group (blood_group)</label>
                <input type="text" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Parent Name (parent_name)</label>
                <input type="text" required value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Parent Mobile (parent_mobile)</label>
                <input type="text" required value={form.parent_mobile} onChange={(e) => setForm({ ...form, parent_mobile: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[#64748B] mb-1">Address (address)</label>
                <textarea rows={2} required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="accent" size="sm" type="submit">Save Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManageStudents;
