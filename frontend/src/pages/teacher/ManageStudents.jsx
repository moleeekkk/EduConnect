import React, { useState } from "react";
import { Users, Plus, Edit, Trash2, Eye, CheckCircle2 } from "lucide-react";
import Button from "../../components/common/Button";
import { mockStudents } from "../../data/mockData";

const TeacherManageStudents = () => {
  const [students, setStudents] = useState(mockStudents);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
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
    if (confirm("Are you sure you want to delete this student record?")) {
      setStudents(students.filter((s) => s.student_id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editStudent) {
      setStudents(students.map((s) => (s.student_id === editStudent.student_id ? { ...s, ...form } : s)));
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
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Manage Students (students Table)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Add, Update, Delete, and View enrolled class students</p>
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
                <tr key={stu.student_id} className="hover:bg-[#F8FAFC]">
                  <td className="p-3.5 font-mono font-bold text-[#2563EB]">{stu.enrollment_no}</td>
                  <td className="p-3.5 font-semibold flex items-center gap-2">
                    <img src={stu.profile_photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                    <span>{stu.first_name} {stu.last_name}</span>
                  </td>
                  <td className="p-3.5 text-[#64748B]">{stu.email}</td>
                  <td className="p-3.5">{stu.mobile}</td>
                  <td className="p-3.5">{stu.gender}</td>
                  <td className="p-3.5 text-[#64748B]">{stu.parent_name} ({stu.parent_mobile})</td>
                  <td className="p-3.5 text-right space-x-1">
                    <button onClick={() => setViewStudent(stu)} className="p-1.5 hover:bg-gray-100 rounded text-[#2563EB]">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenEdit(stu)} className="p-1.5 hover:bg-gray-100 rounded text-[#14B8A6]">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(stu.student_id)} className="p-1.5 hover:bg-gray-100 rounded text-[#EF4444]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">Student Full Profile (students Table)</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-[#64748B]">Enrollment No:</span> <strong className="block text-[#1E293B]">{viewStudent.enrollment_no}</strong></div>
              <div><span className="text-[#64748B]">Full Name:</span> <strong className="block text-[#1E293B]">{viewStudent.first_name} {viewStudent.last_name}</strong></div>
              <div><span className="text-[#64748B]">Email:</span> <strong className="block text-[#1E293B]">{viewStudent.email}</strong></div>
              <div><span className="text-[#64748B]">Mobile:</span> <strong className="block text-[#1E293B]">{viewStudent.mobile}</strong></div>
              <div><span className="text-[#64748B]">Gender:</span> <strong className="block text-[#1E293B]">{viewStudent.gender}</strong></div>
              <div><span className="text-[#64748B]">DOB:</span> <strong className="block text-[#1E293B]">{viewStudent.date_of_birth}</strong></div>
              <div><span className="text-[#64748B]">Blood Group:</span> <strong className="block text-[#1E293B]">{viewStudent.blood_group}</strong></div>
              <div><span className="text-[#64748B]">Admission Date:</span> <strong className="block text-[#1E293B]">{viewStudent.admission_date}</strong></div>
              <div><span className="text-[#64748B]">Parent Name:</span> <strong className="block text-[#1E293B]">{viewStudent.parent_name}</strong></div>
              <div><span className="text-[#64748B]">Parent Mobile:</span> <strong className="block text-[#1E293B]">{viewStudent.parent_mobile}</strong></div>
              <div className="col-span-2"><span className="text-[#64748B]">Address:</span> <strong className="block text-[#1E293B]">{viewStudent.address}</strong></div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setViewStudent(null)}>Close</Button>
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
