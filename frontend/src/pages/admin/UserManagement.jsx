import React, { useState, useEffect } from "react";
import { GraduationCap, School, Plus, Edit, Trash2, Eye, X, RotateCcw } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";
import { mockStudents, mockTeachers, mockInstitutes, mockPrograms, mockSemesters } from "../../data/mockData";

const AdminUserManagement = ({ initialTab = "students" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [students, setStudents] = useState(mockStudents || []);
  const [teachers, setTeachers] = useState(mockTeachers || []);

  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getInstituteName = (instId) => {
    if (!instId) return "Computer Applications";
    const inst = (mockInstitutes || []).find((i) => i.institute_id === instId);
    return inst ? inst.institute_name : "Computer Applications";
  };

  const getInstituteCode = (instId) => {
    if (!instId) return "CA";
    const inst = (mockInstitutes || []).find((i) => i.institute_id === instId);
    return inst ? inst.institute_code : "CA";
  };

  const getDepartmentName = (progId, instId) => {
    if (progId) {
      const prog = (mockPrograms || []).find((p) => p.program_id === progId);
      if (prog) return prog.program_name;
    }
    return "Master of Computer Applications";
  };

  const getDepartmentCode = (progId, instId) => {
    if (progId) {
      const prog = (mockPrograms || []).find((p) => p.program_id === progId);
      if (prog) return prog.program_code;
    }
    return "MCA";
  };

  const getSemesterLabel = (semId) => {
    if (!semId) return "Semester 1";
    const sem = (mockSemesters || []).find((s) => s.semester_id === semId);
    if (sem) return `Semester ${sem.semester_number}`;
    return `Semester ${semId}`;
  };

  const availableDepartments = selectedInstitute === "all"
    ? (mockPrograms || [])
    : (mockPrograms || []).filter((p) => p.institute_id === selectedInstitute);

  const filteredStudents = students.filter((stu) => {
    if (selectedInstitute !== "all") {
      const studentInst = stu.institute_id || "inst-001";
      if (studentInst !== selectedInstitute) return false;
    }

    if (selectedDepartment !== "all") {
      const studentProg = stu.program_id || "prog-001";
      if (studentProg !== selectedDepartment) return false;
    }

    if (selectedSemester !== "all") {
      const studentSem = stu.semester_id || "sem-001";
      if (studentSem !== selectedSemester) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const fullName = `${stu.first_name || ""} ${stu.last_name || ""}`.toLowerCase();
      const enroll = (stu.enrollment_no || "").toLowerCase();
      const email = (stu.email || "").toLowerCase();
      if (!fullName.includes(q) && !enroll.includes(q) && !email.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      if (Array.isArray(data) && data.length > 0) {
        const dbStudents = data
          .filter((u) => u.role === "Student")
          .map((s) => ({
            student_id: s.id,
            enrollment_no: s.identifier || s.id,
            first_name: s.name ? s.name.split(" ")[0] : "",
            last_name: s.name && s.name.split(" ").length > 1 ? s.name.split(" ").slice(1).join(" ") : "",
            email: s.email,
            mobile: "",
            gender: "Male",
            parent_mobile: "",
            institute_id: "inst-001",
            semester_id: "sem-001",
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
            mobile: "",
            designation: t.department || "Faculty Member",
            experience: 0,
            is_active: t.status === "Active",
          }));

        if (dbStudents.length > 0) {
          setStudents(dbStudents);
        }
        if (dbTeachers.length > 0) {
          setTeachers(dbTeachers);
        }
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

  const [viewStudent, setViewStudent] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    enrollment_no: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "",
    address: "",
    institute_id: "inst-001",
    program_id: "prog-001",
    semester_id: "sem-001",
    blood_group: "O+",
    parent_name: "",
    parent_mobile: "",
    parent_email: "",
    admission_date: new Date().toISOString().split("T")[0],
    profile_photo: "",
    is_active: true,
  });

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "",
    address: "",
    qualification: "",
    designation: "",
    experience: 0,
    joining_date: new Date().toISOString().split("T")[0],
    profile_photo: "",
    is_active: true,
  });

  const handleOpenStudentAdd = () => {
    setEditStudent(null);
    setStudentForm({
      enrollment_no: "",
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "",
      address: "",
      institute_id: selectedInstitute !== "all" ? selectedInstitute : "inst-001",
      program_id: selectedDepartment !== "all" ? selectedDepartment : "prog-001",
      semester_id: selectedSemester !== "all" ? selectedSemester : "sem-001",
      blood_group: "O+",
      parent_name: "",
      parent_mobile: "",
      parent_email: "",
      admission_date: new Date().toISOString().split("T")[0],
      profile_photo: "",
      is_active: true,
    });
    setShowStudentModal(true);
  };

  const handleOpenStudentEdit = (stu) => {
    setEditStudent(stu);
    setStudentForm({ ...stu });
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
        student_id: `stu-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...studentForm,
      };
      setStudents([...students, created]);
    }
    setShowStudentModal(false);
  };

  const handleOpenTeacherAdd = () => {
    setEditTeacher(null);
    setTeacherForm({
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "",
      address: "",
      qualification: "",
      designation: "Assistant Professor",
      experience: 0,
      joining_date: new Date().toISOString().split("T")[0],
      profile_photo: "",
      is_active: true,
    });
    setShowTeacherModal(true);
  };

  const handleOpenTeacherEdit = (t) => {
    setEditTeacher(t);
    setTeacherForm({ ...t });
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
        teacher_id: `teach-${Date.now()}`,
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

      {/* Filter Bar */}
      {activeTab === "students" && (
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedInstitute}
                  onChange={(e) => setSelectedInstitute(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
                >
                  <option value="all">All Institutes ({(mockInstitutes || []).length})</option>
                  {mockInstitutes && mockInstitutes.map((inst) => (
                    <option key={inst.institute_id} value={inst.institute_id}>
                      {inst.institute_code} - {inst.institute_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
                >
                  <option value="all">All Departments</option>
                  {availableDepartments.map((prog) => (
                    <option key={prog.program_id} value={prog.program_id}>
                      {prog.program_code} - {prog.program_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[180px]">
                <input
                  type="text"
                  placeholder="Search name, enrollment, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl text-xs font-extrabold">
                {filteredStudents.length} Students
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <th className="p-3.5">Institute / Department</th>
                  <th className="p-3.5">Semester</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#64748B] font-medium">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr key={stu.student_id} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">{stu.enrollment_no}</td>
                      <td className="p-3.5 font-semibold">{stu.first_name} {stu.last_name}</td>
                      <td className="p-3.5 text-[#64748B]">{stu.email}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-[#1E293B]">{getInstituteCode(stu.institute_id)}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[11px]">
                          {getSemesterLabel(stu.semester_id)}
                        </span>
                      </td>
                      <td className="p-3.5">{stu.mobile}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewStudent(stu)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenStudentEdit(stu)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu.student_id)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444]"
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
                      No faculty records found.
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
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenTeacherEdit(t)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t.teacher_id)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444]"
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

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2563EB]" /> Student Information
              </h3>
              <button
                onClick={() => setViewStudent(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <h4 className="text-lg font-extrabold text-[#1E293B]">
                  {viewStudent.first_name} {viewStudent.last_name}
                </h4>
                <p className="font-mono text-[#2563EB] font-bold text-xs">Enrollment No: {viewStudent.enrollment_no}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {viewTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <School className="w-5 h-5 text-[#14B8A6]" /> Faculty Profile Details
              </h3>
              <button
                onClick={() => setViewTeacher(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <h4 className="text-base font-extrabold text-[#1E293B]">
                  {viewTeacher.first_name} {viewTeacher.last_name}
                </h4>
                <p className="font-mono text-[#14B8A6] font-bold text-xs">Employee ID: {viewTeacher.employee_id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Add/Edit Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editStudent ? "Edit Student Information" : "Add New Student Record"}
            </h3>
            <form onSubmit={handleSaveStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Enrollment No</label>
                <input
                  type="text"
                  required
                  value={studentForm.enrollment_no}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollment_no: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">First Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.first_name}
                  onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Last Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.last_name}
                  onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
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

      {/* Teacher Add/Edit Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editTeacher ? "Edit Faculty Information" : "Add New Teacher Record"}
            </h3>
            <form onSubmit={handleSaveTeacher} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Employee ID</label>
                <input
                  type="text"
                  required
                  value={teacherForm.employee_id}
                  onChange={(e) => setTeacherForm({ ...teacherForm, employee_id: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">First Name</label>
                <input
                  type="text"
                  required
                  value={teacherForm.first_name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Last Name</label>
                <input
                  type="text"
                  required
                  value={teacherForm.last_name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, last_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
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
