import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, X, GraduationCap } from "lucide-react";
import Button from "../../components/common/Button";
import { mockStudents } from "../../data/mockData";

const TeacherManageStudents = () => {
  const [students, setStudents] = useState(mockStudents || []);
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
      enrollment_no: "",
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "",
      address: "",
      blood_group: "O+",
      parent_name: "",
      parent_mobile: "",
      admission_date: new Date().toISOString().split("T")[0],
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
        student_id: `stu-${Date.now()}`,
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
              {students && students.length > 0 ? (
                students.map((stu) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-[#64748B]">
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2563EB]" /> Student Profile Details
              </h3>
              <button
                onClick={() => setViewStudent(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div>
                  <h4 className="text-base font-extrabold text-[#1E293B]">
                    {viewStudent.first_name} {viewStudent.last_name}
                  </h4>
                  <p className="font-mono text-[#2563EB] font-bold text-xs">
                    Enrollment No: {viewStudent.enrollment_no}
                  </p>
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
                <label className="block text-[#64748B] mb-1">Enrollment No</label>
                <input type="text" required value={form.enrollment_no} onChange={(e) => setForm({ ...form, enrollment_no: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">First Name</label>
                <input type="text" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Last Name</label>
                <input type="text" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Mobile</label>
                <input type="text" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full p-2 border border-[#E2E8F0] rounded-lg">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
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
