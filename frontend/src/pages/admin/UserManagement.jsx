import React, { useState, useEffect } from "react";
import { GraduationCap, School, Plus, Edit, Trash2, Eye, X, Check, Power, Users } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const AdminUserManagement = ({ initialTab = "students" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadMasterData = async () => {
    try {
      const [instData, progData] = await Promise.all([
        adminApi.getInstitutes(),
        adminApi.getPrograms(),
      ]);
      setInstitutes(Array.isArray(instData) ? instData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
    } catch (err) {
      console.log("Master data fetch error:", err);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedInstitute !== "all") params.instituteId = selectedInstitute;
      if (selectedDepartment !== "all") params.programId = selectedDepartment;
      if (selectedSemester !== "all") params.semesterId = selectedSemester;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await adminApi.getStudents(params);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error loading students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedInstitute !== "all") params.instituteId = selectedInstitute;
      if (selectedDepartment !== "all") params.designation = selectedDepartment;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await adminApi.getTeachers(params);
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error loading teachers:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (activeTab === "students") {
      loadStudents();
    } else {
      loadTeachers();
    }
  }, [activeTab, selectedInstitute, selectedDepartment, selectedSemester, searchQuery]);

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
    is_active: true,
  });

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "Female",
    date_of_birth: "",
    address: "",
    designation: "Assistant Professor",
    institute_id: "",
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
      institute_id: selectedInstitute !== "all" ? selectedInstitute : "",
      program_id: selectedDepartment !== "all" ? selectedDepartment : "",
      semester_id: selectedSemester !== "all" ? selectedSemester : "",
      is_active: true,
    });
    setShowStudentModal(true);
  };

  const handleOpenStudentEdit = (stu) => {
    setEditStudent(stu);
    setStudentForm({ ...stu });
    setShowStudentModal(true);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student record?")) {
      try {
        await adminApi.deleteStudent(id);
        loadStudents();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete student");
      }
    }
  };

  const handleToggleStudentStatus = async (stu) => {
    try {
      await adminApi.patchStudentStatus(stu.student_id, !stu.is_active);
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await adminApi.updateStudent(editStudent.student_id, studentForm);
      } else {
        await adminApi.createStudent(studentForm);
      }
      setShowStudentModal(false);
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleOpenTeacherAdd = () => {
    setEditTeacher(null);
    setTeacherForm({
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: "Female",
      date_of_birth: "",
      address: "",
      designation: "Assistant Professor",
      institute_id: selectedInstitute !== "all" ? selectedInstitute : "",
      is_active: true,
    });
    setShowTeacherModal(true);
  };

  const handleOpenTeacherEdit = (t) => {
    setEditTeacher(t);
    setTeacherForm({ ...t });
    setShowTeacherModal(true);
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher record?")) {
      try {
        await adminApi.deleteTeacher(id);
        loadTeachers();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete teacher");
      }
    }
  };

  const handleToggleTeacherStatus = async (t) => {
    try {
      await adminApi.patchTeacherStatus(t.teacher_id, !t.is_active);
      loadTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      if (editTeacher) {
        await adminApi.updateTeacher(editTeacher.teacher_id, teacherForm);
      } else {
        await adminApi.createTeacher(teacherForm);
      }
      setShowTeacherModal(false);
      loadTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
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
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex-1 min-w-[160px]">
              <select
                value={selectedInstitute}
                onChange={(e) => setSelectedInstitute(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
              >
                <option value="all">All Institutes ({institutes.length})</option>
                {institutes.map((inst) => (
                  <option key={inst.institute_id} value={inst.institute_id}>
                    {inst.institute_code} - {inst.institute_name}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === "students" && (
              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
                >
                  <option value="all">All Departments</option>
                  {programs.map((prog) => (
                    <option key={prog.program_id} value={prog.program_id}>
                      {prog.program_code} - {prog.program_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder={activeTab === "students" ? "Search name, enrollment, email..." : "Search name, email, designation..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl text-xs font-extrabold">
              {activeTab === "students" ? `${students.length} Students` : `${teachers.length} Faculty`}
            </div>
          </div>
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
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#64748B] font-medium">
                      Loading students from database...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#64748B] font-medium">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  students.map((stu) => (
                    <tr key={stu.student_id} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">{stu.enrollment_no}</td>
                      <td className="p-3.5 font-semibold">{stu.first_name} {stu.last_name}</td>
                      <td className="p-3.5 text-[#64748B]">{stu.email}</td>
                      <td className="p-3.5 font-medium">{stu.program_name || stu.department || "Computer Applications"}</td>
                      <td className="p-3.5">
                        <span
                          onClick={() => handleToggleStudentStatus(stu)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            stu.is_active ? "bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {stu.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3.5">{stu.mobile}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewStudent(stu)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB]"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenStudentEdit(stu)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6]"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu.student_id)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444]"
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
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#64748B] font-medium">
                      Loading faculty from database...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
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
                      <td className="p-3.5">
                        <span
                          onClick={() => handleToggleTeacherStatus(t)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            t.is_active ? "bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {t.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewTeacher(t)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB]"
                            title="View Faculty"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenTeacherEdit(t)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6]"
                            title="Edit Faculty"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t.teacher_id)}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444]"
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

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2563EB]" /> Student Profile Record
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
                <p className="text-xs text-[#64748B] mt-1">Email: <strong>{viewStudent.email}</strong></p>
                <p className="text-xs text-[#64748B]">Mobile: {viewStudent.mobile}</p>
                <p className="text-xs text-[#64748B]">Department: {viewStudent.program_name || viewStudent.department}</p>
                <p className="text-xs text-[#64748B]">Status: <span className="font-bold text-[#22C55E]">{viewStudent.status}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {viewTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#14B8A6]" /> Faculty Profile Record
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
                <h4 className="text-lg font-extrabold text-[#1E293B]">
                  {viewTeacher.first_name} {viewTeacher.last_name}
                </h4>
                <p className="font-mono text-[#14B8A6] font-bold text-xs">Employee ID: {viewTeacher.employee_id}</p>
                <p className="text-xs text-[#64748B] mt-1">Email: <strong>{viewTeacher.email}</strong></p>
                <p className="text-xs text-[#64748B]">Mobile: {viewTeacher.mobile}</p>
                <p className="text-xs text-[#64748B]">Designation: {viewTeacher.designation}</p>
                <p className="text-xs text-[#64748B]">Institute: {viewTeacher.institute_name}</p>
                <p className="text-xs text-[#64748B]">Status: <span className="font-bold text-[#22C55E]">{viewTeacher.status}</span></p>
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
                  disabled={!!editStudent}
                  value={studentForm.enrollment_no}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollment_no: e.target.value })}
                  placeholder="e.g. 25CI2110016"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Email Address (OTP Compatible)</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="e.g. student@gmail.com"
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
                <label className="block text-[#64748B] mb-1 font-semibold">Mobile Number</label>
                <input
                  type="text"
                  value={studentForm.mobile}
                  onChange={(e) => setStudentForm({ ...studentForm, mobile: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Gender</label>
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
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editTeacher ? "Edit Faculty Member Record" : "Add New Faculty Member"}
            </h3>
            <form onSubmit={handleSaveTeacher} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">First Name</label>
                <input
                  type="text"
                  required
                  value={teacherForm.first_name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })}
                  placeholder="e.g. Eleanor"
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
                  placeholder="e.g. Vance"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  placeholder="e.g. eleanor.vance@educonnect.ac.in"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Mobile Number</label>
                <input
                  type="text"
                  value={teacherForm.mobile}
                  onChange={(e) => setTeacherForm({ ...teacherForm, mobile: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Designation / Department</label>
                <input
                  type="text"
                  required
                  value={teacherForm.designation}
                  onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                  placeholder="e.g. Associate Professor"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Gender</label>
                <select
                  value={teacherForm.gender}
                  onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowTeacherModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save Faculty Record
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
