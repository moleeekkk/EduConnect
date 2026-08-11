import React, { useState, useEffect } from "react";
import { GraduationCap, School, Plus, Edit, Trash2, Eye, UserCheck, Calendar, Phone, Mail, MapPin, Award, BookOpen, AtSign, X } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const AdminUserManagement = ({ initialTab = "students" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      if (Array.isArray(data)) {
        const dbStudents = data
          .filter((u) => u.role === "Student")
          .map((s) => ({
            student_id: s.id,
            enrollment_no: s.identifier || s.id,
            first_name: s.name ? s.name.split(" ")[0] : "",
            last_name: s.name && s.name.split(" ").length > 1 ? s.name.split(" ").slice(1).join(" ") : "",
            email: s.email,
            mobile: "+91 9876543210",
            gender: "Male",
            parent_mobile: "+91 9876543210",
            is_active: s.status === "Active",
          }));
        const dbTeachers = data
          .filter((u) => u.role === "Teacher")
          .map((t) => ({
            teacher_id: t.id,
            employee_id: t.id,
            first_name: t.name ? t.name.split(" ")[0] : "",
            last_name: t.name && t.name.split(" ").length > 1 ? t.name.split(" ").slice(1).join(" ") : "",
            email: t.email,
            mobile: "+91 9876543210",
            designation: t.department || "Assistant Professor",
            experience: 5,
            is_active: t.status === "Active",
          }));
        setStudents(dbStudents);
        setTeachers(dbTeachers);
      }
    } catch (err) {
      console.log("Error loading users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // View Details Modal States
  const [viewStudent, setViewStudent] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);

  // Student Form Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    enrollment_no: "",
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
    parent_email: "",
    admission_date: "2025-07-20",
    profile_photo: "",
    is_active: true,
  });

  // Teacher Form Modal State
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "1985-05-15",
    address: "",
    qualification: "",
    designation: "",
    experience: 5,
    joining_date: "2020-08-01",
    profile_photo: "",
    is_active: true,
  });

  // Student Handlers
  const handleOpenStudentAdd = () => {
    setEditStudent(null);
    setStudentForm({
      enrollment_no: `25CI21100${students.length + 20}`,
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
      parent_email: "",
      admission_date: "2025-07-20",
      profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      is_active: true,
    });
    setShowStudentModal(true);
  };

  const handleOpenStudentEdit = (stu) => {
    setEditStudent(stu);
    setStudentForm({
      enrollment_no: stu.enrollment_no || "",
      first_name: stu.first_name || "",
      last_name: stu.last_name || "",
      email: stu.email || "",
      mobile: stu.mobile || "",
      gender: stu.gender || "Male",
      date_of_birth: stu.date_of_birth || "2003-01-01",
      address: stu.address || "",
      blood_group: stu.blood_group || "O+",
      parent_name: stu.parent_name || "",
      parent_mobile: stu.parent_mobile || "",
      parent_email: stu.parent_email || "",
      admission_date: stu.admission_date || "2025-07-20",
      profile_photo: stu.profile_photo || "",
      is_active: stu.is_active !== undefined ? stu.is_active : true,
    });
    setShowStudentModal(true);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student record?")) {
      setStudents(students.filter((s) => s.student_id !== id));
    }
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (editStudent) {
      setStudents(
        students.map((s) => (s.student_id === editStudent.student_id ? { ...s, ...studentForm, updated_at: new Date().toISOString() } : s))
      );
    } else {
      const created = {
        student_id: `stu-00${students.length + 1}`,
        batch_id: "batch-001",
        semester_id: "sem-003",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...studentForm,
      };
      setStudents([...students, created]);
    }
    setShowStudentModal(false);
  };

  // Teacher Handlers
  const handleOpenTeacherAdd = () => {
    setEditTeacher(null);
    setTeacherForm({
      employee_id: `FAC-${8090 + teachers.length + 5}`,
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "1985-05-15",
      address: "",
      qualification: "Ph.D. in Computer Science",
      designation: "Assistant Professor",
      experience: 6,
      joining_date: "2021-08-01",
      profile_photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      is_active: true,
    });
    setShowTeacherModal(true);
  };

  const handleOpenTeacherEdit = (t) => {
    setEditTeacher(t);
    setTeacherForm({
      employee_id: t.employee_id || "",
      first_name: t.first_name || "",
      last_name: t.last_name || "",
      email: t.email || "",
      mobile: t.mobile || "",
      gender: t.gender || "Male",
      date_of_birth: t.date_of_birth || "1985-05-15",
      address: t.address || "",
      qualification: t.qualification || "",
      designation: t.designation || "",
      experience: t.experience || 5,
      joining_date: t.joining_date || "2020-08-01",
      profile_photo: t.profile_photo || "",
      is_active: t.is_active !== undefined ? t.is_active : true,
    });
    setShowTeacherModal(true);
  };

  const handleDeleteTeacher = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher record?")) {
      setTeachers(teachers.filter((t) => t.teacher_id !== id));
    }
  };

  const handleSaveTeacher = (e) => {
    e.preventDefault();
    if (editTeacher) {
      setTeachers(
        teachers.map((t) => (t.teacher_id === editTeacher.teacher_id ? { ...t, ...teacherForm, updated_at: new Date().toISOString() } : t))
      );
    } else {
      const created = {
        teacher_id: `teach-00${teachers.length + 1}`,
        password: "hashed_password",
        institute_id: "inst-001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...teacherForm,
      };
      setTeachers([...teachers, created]);
    }
    setShowTeacherModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">
            {activeTab === "students" ? "Student Management" : "Teacher Management"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={activeTab === "students" ? handleOpenStudentAdd : handleOpenTeacherAdd}
            className="text-xs"
          >
            {activeTab === "students" ? "Add Student" : "Add Faculty"}
          </Button>
        </div>
      </div>

      {/* Content View */}
      {activeTab === "students" ? (
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
                  <th className="p-3.5">Parent Mobile</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#64748B] font-medium">
                      No student records found in database. Click <strong className="text-[#2563EB]">"Add Student"</strong> to create a new student record.
                    </td>
                  </tr>
                ) : (
                  students.map((stu) => (
                    <tr key={stu.student_id} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">{stu.enrollment_no}</td>
                      <td className="p-3.5 font-semibold">{stu.first_name} {stu.last_name}</td>
                      <td className="p-3.5 text-[#64748B]">{stu.email}</td>
                      <td className="p-3.5">{stu.mobile}</td>
                      <td className="p-3.5">{stu.gender}</td>
                      <td className="p-3.5 text-[#64748B]">{stu.parent_mobile}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewStudent(stu)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenStudentEdit(stu)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors"
                            title="Edit Full Info"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu.student_id)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Employee ID</th>
                  <th className="p-3.5">Faculty Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Experience</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#64748B] font-medium">
                      No faculty records found in database. Click <strong className="text-[#14B8A6]">"Add Faculty"</strong> to create a new teacher record.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.teacher_id} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#14B8A6]">{t.employee_id}</td>
                      <td className="p-3.5 font-semibold">{t.first_name} {t.last_name}</td>
                      <td className="p-3.5 text-[#64748B]">{t.email}</td>
                      <td className="p-3.5">{t.mobile}</td>
                      <td className="p-3.5 font-medium">{t.designation}</td>
                      <td className="p-3.5 text-[#64748B]">{t.experience} Years</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewTeacher(t)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenTeacherEdit(t)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors"
                            title="Edit Full Info"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t.teacher_id)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Student Details Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2563EB]" /> Complete Student Information
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
              {/* Profile Top Bar */}
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <img
                  src={viewStudent.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={viewStudent.first_name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-[#2563EB]/30 shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-[#1E293B]">
                    {viewStudent.first_name} {viewStudent.last_name}
                  </h4>
                  <p className="font-mono text-[#2563EB] font-bold text-xs">Enrollment No: {viewStudent.enrollment_no}</p>
                  <p className="text-[11px] text-[#64748B]">Program: Master of Computer Applications (MCA)</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewStudent.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                      {viewStudent.is_active ? "Active Student" : "Inactive Account"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold">
                      Batch 2025-2027 • Sem 3
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprehensive Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Student ID (student_id)</span>
                  <p className="font-mono font-bold text-[#1E293B]">{viewStudent.student_id || "stu-001"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Institutional Email (email)</span>
                  <p className="font-medium text-[#2563EB] truncate">{viewStudent.email}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Personal Phone (mobile)</span>
                  <p className="font-mono text-[#1E293B] font-bold">{viewStudent.mobile}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Gender & Date of Birth</span>
                  <p className="font-medium text-[#1E293B]">{viewStudent.gender} • {viewStudent.date_of_birth}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Blood Group (blood_group)</span>
                  <p className="font-bold text-[#EF4444]">{viewStudent.blood_group || "O+"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Admission Date (admission_date)</span>
                  <p className="font-mono text-[#1E293B]">{viewStudent.admission_date}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Parent / Guardian Name</span>
                  <p className="font-bold text-[#1E293B]">{viewStudent.parent_name}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Parent Phone & Email</span>
                  <p className="font-mono text-[#14B8A6] font-bold">{viewStudent.parent_mobile}</p>
                  <p className="text-[10px] text-[#64748B] font-mono">{viewStudent.parent_email || "parent@gmail.com"}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Residential Address (address)</span>
                <p className="font-medium text-[#1E293B]">{viewStudent.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Teacher Details Modal */}
      {viewTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <School className="w-5 h-5 text-[#14B8A6]" /> Faculty Profile Details
              </h3>
              <button
                onClick={() => setViewTeacher(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <img
                  src={viewTeacher.profile_photo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                  alt={viewTeacher.first_name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0]"
                />
                <div>
                  <h4 className="text-base font-extrabold text-[#1E293B]">
                    {viewTeacher.first_name} {viewTeacher.last_name}
                  </h4>
                  <p className="font-mono text-[#14B8A6] font-bold text-xs">Employee ID: {viewTeacher.employee_id}</p>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">{viewTeacher.designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Email Address</span>
                  <p className="font-medium text-[#1E293B]">{viewTeacher.email}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Mobile Number</span>
                  <p className="font-mono text-[#1E293B] font-bold">{viewTeacher.mobile}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Qualification</span>
                  <p className="font-bold text-[#2563EB]">{viewTeacher.qualification}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Experience & Joining</span>
                  <p className="font-medium text-[#1E293B]">{viewTeacher.experience} Years • {viewTeacher.joining_date}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Gender & DOB</span>
                  <p className="font-medium text-[#1E293B]">{viewTeacher.gender} • {viewTeacher.date_of_birth}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Status</span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${viewTeacher.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                    {viewTeacher.is_active ? "Active Faculty" : "Inactive Account"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Residential Address</span>
                <p className="font-medium text-[#1E293B]">{viewTeacher.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Edit Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editStudent ? "Edit Complete Student Information" : "Add New Student Record"}
            </h3>
            <form onSubmit={handleSaveStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Enrollment No (enrollment_no)</label>
                <input
                  type="text"
                  required
                  value={studentForm.enrollment_no}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollment_no: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono font-bold text-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">First Name (first_name)</label>
                <input
                  type="text"
                  required
                  value={studentForm.first_name}
                  onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Last Name (last_name)</label>
                <input
                  type="text"
                  required
                  value={studentForm.last_name}
                  onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Student Email (email)</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Student Mobile (mobile)</label>
                <input
                  type="text"
                  required
                  value={studentForm.mobile}
                  onChange={(e) => setStudentForm({ ...studentForm, mobile: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Gender (gender)</label>
                <select
                  value={studentForm.gender}
                  onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Date of Birth (date_of_birth)</label>
                <input
                  type="date"
                  required
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Blood Group (blood_group)</label>
                <select
                  value={studentForm.blood_group}
                  onChange={(e) => setStudentForm({ ...studentForm, blood_group: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                >
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="O-">O-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Admission Date (admission_date)</label>
                <input
                  type="date"
                  required
                  value={studentForm.admission_date}
                  onChange={(e) => setStudentForm({ ...studentForm, admission_date: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Parent Name (parent_name)</label>
                <input
                  type="text"
                  required
                  value={studentForm.parent_name}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Parent Mobile (parent_mobile)</label>
                <input
                  type="text"
                  required
                  value={studentForm.parent_mobile}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_mobile: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Parent Email (parent_email)</label>
                <input
                  type="email"
                  value={studentForm.parent_email}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
                  placeholder="parent@gmail.com"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#64748B] mb-1 font-semibold">Upload Profile Photo File (profile_photo)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setStudentForm({ ...studentForm, profile_photo: url });
                      }
                    }}
                    className="w-full p-2 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg text-xs"
                  />
                  {studentForm.profile_photo && (
                    <img
                      src={studentForm.profile_photo}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#64748B] mb-1 font-semibold">Residential Address (address)</label>
                <textarea
                  rows={2}
                  required
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="student_active"
                  checked={studentForm.is_active}
                  onChange={(e) => setStudentForm({ ...studentForm, is_active: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="student_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                  Account Active Status (is_active)
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowStudentModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Student Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Edit Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editTeacher ? "Edit Complete Faculty Information" : "Add New Teacher Record"}
            </h3>
            <form onSubmit={handleSaveTeacher} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Employee ID (employee_id)</label>
                <input
                  type="text"
                  required
                  value={teacherForm.employee_id}
                  onChange={(e) => setTeacherForm({ ...teacherForm, employee_id: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono font-bold text-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">First Name (first_name)</label>
                <input
                  type="text"
                  required
                  value={teacherForm.first_name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Last Name (last_name)</label>
                <input
                  type="text"
                  required
                  value={teacherForm.last_name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, last_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Email (email)</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Mobile (mobile)</label>
                <input
                  type="text"
                  required
                  value={teacherForm.mobile}
                  onChange={(e) => setTeacherForm({ ...teacherForm, mobile: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Designation (designation)</label>
                <input
                  type="text"
                  required
                  value={teacherForm.designation}
                  onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Qualification (qualification)</label>
                <input
                  type="text"
                  required
                  value={teacherForm.qualification}
                  onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Experience in Years (experience)</label>
                <input
                  type="number"
                  required
                  value={teacherForm.experience}
                  onChange={(e) => setTeacherForm({ ...teacherForm, experience: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Joining Date (joining_date)</label>
                <input
                  type="date"
                  required
                  value={teacherForm.joining_date}
                  onChange={(e) => setTeacherForm({ ...teacherForm, joining_date: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Gender (gender)</label>
                <select
                  value={teacherForm.gender}
                  onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#64748B] mb-1 font-semibold">Upload Profile Photo File (profile_photo)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setTeacherForm({ ...teacherForm, profile_photo: url });
                      }
                    }}
                    className="w-full p-2 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg text-xs"
                  />
                  {teacherForm.profile_photo && (
                    <img
                      src={teacherForm.profile_photo}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#64748B] mb-1 font-semibold">Residential Address (address)</label>
                <textarea
                  rows={2}
                  required
                  value={teacherForm.address}
                  onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="teacher_active"
                  checked={teacherForm.is_active}
                  onChange={(e) => setTeacherForm({ ...teacherForm, is_active: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#14B8A6] focus:ring-[#14B8A6]"
                />
                <label htmlFor="teacher_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                  Faculty Active Status (is_active)
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowTeacherModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Teacher Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
