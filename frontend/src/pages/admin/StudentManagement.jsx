import React, { useState, useEffect } from "react";
import { GraduationCap, Plus, Edit, Trash2, Eye, Calendar, Phone, Mail, MapPin, AtSign, X, Building2, Search, RotateCcw, Filter } from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Institute, Department & Semester Filter States for Admin Student Management
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllData = async () => {
    try {
      const [usersRes, instRes, progRes, semRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getInstitutes(),
        adminApi.getPrograms(),
        adminApi.getSemesters(),
      ]);

      const instList = Array.isArray(instRes) ? instRes : [];
      const progList = Array.isArray(progRes) ? progRes : [];
      const semList = Array.isArray(semRes) ? semRes : [];

      setInstitutes(instList);
      setPrograms(progList);
      setSemesters(semList);

      if (Array.isArray(usersRes)) {
        const dbStudents = usersRes
          .filter((u) => (u.role || "").toLowerCase() === "student" || u.enrollmentNo || u.enrollment_no)
          .map((s) => ({
            student_id: s.student_id || s.id || s.enrollment_no || s.identifier,
            enrollment_no: s.enrollment_no || s.identifier || s.id,
            first_name: s.first_name || (s.name ? s.name.split(" ")[0] : ""),
            last_name: s.last_name || (s.name && s.name.split(" ").length > 1 ? s.name.split(" ").slice(1).join(" ") : ""),
            email: s.email,
            mobile: s.mobile || "+91 9876543210",
            gender: s.gender || "Male",
            date_of_birth: s.date_of_birth || "2003-01-01",
            parent_name: s.parent_name || "Parent / Guardian",
            parent_mobile: s.parent_mobile || "+91 9876543210",
            parent_email: s.parent_email || "parent@gmail.com",
            address: s.address || "Campus Hostel",
            profile_photo: s.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            institute_id: s.institute_id || (instList.length > 0 ? (instList[0].institute_id || instList[0].id) : ""),
            program_id: s.program_id || (progList.length > 0 ? (progList[0].department_id || progList[0].program_id || progList[0].id) : ""),
            semester_id: s.semester_id || (semList.length > 0 ? (semList[0].semester_id || semList[0].id) : ""),
            is_active: s.status === "Active" || s.is_active === true,
          }));

        setStudents(dbStudents);
      }
    } catch (err) {
      console.error("Student management load error:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Helper to map institute_id to Institute Name & Code
  const getInstituteName = (instId) => {
    if (!instId) return "Main Campus";
    const inst = institutes.find((i) => (i.institute_id || i.id) === instId || i.institute_code === instId);
    return inst ? (inst.institute_name || inst.name) : "Main Campus";
  };

  const getInstituteCode = (instId) => {
    if (!instId) return "CA";
    const inst = institutes.find((i) => (i.institute_id || i.id) === instId || i.institute_code === instId);
    return inst ? (inst.institute_code || inst.code) : "CA";
  };

  // Helper to map program_id / department_id to Department Name & Code
  const getDepartmentName = (progId, instId) => {
    if (progId) {
      const prog = programs.find((p) => (p.department_id || p.program_id || p.id) === progId || p.department_code === progId || p.program_code === progId);
      if (prog) return prog.department_name || prog.program_name || prog.name;
    }
    return "Department of Computer Applications";
  };

  const getDepartmentCode = (progId, instId) => {
    if (progId) {
      const prog = programs.find((p) => (p.department_id || p.program_id || p.id) === progId || p.department_code === progId || p.program_code === progId);
      if (prog) return prog.department_code || prog.program_code || prog.code;
    }
    return "MCA";
  };

  // Helper to map semester_id to Semester Label
  const getSemesterLabel = (semId) => {
    if (!semId) return "Semester 1";
    const sem = semesters.find((s) => (s.semester_id || s.id) === semId || s.semester_number == semId);
    if (sem) return sem.semester_name || `Semester ${sem.semester_number || sem.number}`;
    if (typeof semId === "string" && semId.startsWith("sem-00")) {
      return `Semester ${semId.replace("sem-00", "")}`;
    }
    return `Semester ${semId}`;
  };

  // Dynamic Semester helper based on selected Department / Program from database
  const getAvailableSemestersForDepartment = (deptId) => {
    if (!semesters || semesters.length === 0) return [];
    if (!deptId || deptId === "all") return semesters;

    const targetDept = programs.find((p) => (p.department_id || p.program_id || p.id) === deptId || p.department_code === deptId || p.program_code === deptId);
    const targetId = targetDept ? (targetDept.department_id || targetDept.program_id || targetDept.id) : deptId;

    const filtered = semesters.filter((s) => {
      const sProg = s.program_id || s.programId || s.department_id || s.departmentId;
      return sProg === targetId || sProg === deptId;
    });

    return filtered.length > 0 ? filtered : semesters;
  };

  // Available departments dropdown list based on selected institute
  const availableDepartments = selectedInstitute === "all"
    ? programs
    : programs.filter((p) => (p.institute_id || p.instituteId) === selectedInstitute);

  // Filtered Students Array
  const filteredStudents = students.filter((stu) => {
    if (selectedInstitute !== "all") {
      if (stu.institute_id && stu.institute_id !== selectedInstitute) {
        const matchesCode = getInstituteCode(stu.institute_id) === getInstituteCode(selectedInstitute);
        if (!matchesCode) return false;
      }
    }
    if (selectedDepartment !== "all") {
      if (stu.program_id && stu.program_id !== selectedDepartment) {
        const matchesCode = getDepartmentCode(stu.program_id) === getDepartmentCode(selectedDepartment);
        if (!matchesCode) return false;
      }
    }
    if (selectedSemester !== "all") {
      if (stu.semester_id && stu.semester_id !== selectedSemester) {
        const matchesLabel = getSemesterLabel(stu.semester_id) === getSemesterLabel(selectedSemester);
        if (!matchesLabel) return false;
      }
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

  // Modal States
  const [viewStudent, setViewStudent] = useState(null);
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
    institute_id: "",
    program_id: "",
    semester_id: "",
    blood_group: "O+",
    parent_name: "",
    parent_mobile: "",
    parent_email: "",
    admission_date: "2025-07-20",
    profile_photo: "",
    is_active: true,
  });

  const handleOpenStudentAdd = () => {
    setEditStudent(null);
    const defaultInst = selectedInstitute !== "all"
      ? selectedInstitute
      : (institutes.length > 0 ? (institutes[0].institute_id || institutes[0].id) : "");
    const defaultProg = selectedDepartment !== "all"
      ? selectedDepartment
      : (programs.length > 0 ? (programs[0].department_id || programs[0].program_id || programs[0].id) : "");
    
    const availableSems = getAvailableSemestersForDepartment(defaultProg);
    const defaultSem = selectedSemester !== "all"
      ? selectedSemester
      : (availableSems.length > 0 ? (availableSems[0].semester_id || availableSems[0].id) : "");

    setStudentForm({
      enrollment_no: `25CI21100${students.length + 20}`,
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "2003-01-01",
      address: "",
      institute_id: defaultInst,
      program_id: defaultProg,
      semester_id: defaultSem,
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
      institute_id: stu.institute_id || (institutes.length > 0 ? (institutes[0].institute_id || institutes[0].id) : ""),
      program_id: stu.program_id || (programs.length > 0 ? (programs[0].department_id || programs[0].program_id || programs[0].id) : ""),
      semester_id: stu.semester_id || (semesters.length > 0 ? (semesters[0].semester_id || semesters[0].id) : ""),
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

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await adminApi.deleteStudent(deletingUser.id);
      await fetchAllData();
    } catch (err) {
      console.error("Delete student error:", err);
    } finally {
      setDeleting(false);
      setDeletingUser(null);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await adminApi.updateStudent(editStudent.student_id || editStudent.id || editStudent.enrollment_no, studentForm);
      } else {
        await adminApi.createStudent(studentForm);
      }
      await fetchAllData();
    } catch (err) {
      console.error("Save student error:", err);
    }
    setShowStudentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Student Management</h1>
          <p className="text-xs text-[#64748B] mt-1">Manage institutional student records, departmental semester assignments, and profile data.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={handleOpenStudentAdd}
            className="text-xs"
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Student Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Institute Selection Filter */}
            <div className="flex-1 min-w-[160px]">
              <select
                value={selectedInstitute}
                onChange={(e) => {
                  const newInst = e.target.value;
                  setSelectedInstitute(newInst);
                  if (newInst !== "all") {
                    const validProgs = programs.filter((p) => (p.institute_id || p.instituteId) === newInst);
                    if (!validProgs.some((p) => (p.department_id || p.program_id || p.id) === selectedDepartment)) {
                      setSelectedDepartment("all");
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
              >
                <option value="all">All Institutes ({institutes.length})</option>
                {institutes.map((inst) => (
                  <option key={inst.institute_id || inst.id} value={inst.institute_id || inst.id}>
                    {inst.institute_code || inst.code} - {inst.institute_name || inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Selection Filter */}
            <div className="flex-1 min-w-[160px]">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
              >
                <option value="all">All Departments</option>
                {availableDepartments.map((prog) => (
                  <option key={prog.department_id || prog.program_id || prog.id} value={prog.department_id || prog.program_id || prog.id}>
                    {prog.department_code || prog.program_code || prog.code} - {prog.department_name || prog.program_name || prog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Selection Filter */}
            <div className="w-full sm:w-auto min-w-[140px]">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {getAvailableSemestersForDepartment(selectedDepartment).map((sem) => (
                  <option key={sem.semester_id || sem.id} value={sem.semester_id || sem.id}>
                    {sem.semester_name || `Semester ${sem.semester_number || sem.number}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Query Input */}
            <div className="flex-1 min-w-[180px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, enrollment, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder-[#64748B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reset Filters & Student Count */}
          <div className="flex items-center gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0">
            {(selectedInstitute !== "all" || selectedDepartment !== "all" || selectedSemester !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedInstitute("all");
                  setSelectedDepartment("all");
                  setSelectedSemester("all");
                  setSearchQuery("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 rounded-xl transition-all cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
            <div className="px-3.5 py-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl text-xs font-extrabold border border-[#2563EB]/20">
              {filteredStudents.length} Students
            </div>
          </div>
        </div>
      </div>

      {/* Student List View Table */}
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
                    No student records match the selected filters. Try clearing filters or click <strong className="text-[#2563EB]">"Add Student"</strong> to create a new record.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.student_id || stu.id || stu.enrollment_no} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-mono font-bold text-[#2563EB]">{stu.enrollment_no || stu.enrollmentNo || stu.identifier || stu.id}</td>
                    <td className="p-3.5 font-semibold">{stu.first_name || stu.firstName || stu.name} {stu.last_name || stu.lastName || ""}</td>
                    <td className="p-3.5 text-[#64748B]">{stu.email}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#1E293B]">{getInstituteCode(stu.institute_id)}</span>
                      <span className="text-[#64748B] text-[11px] block">{getDepartmentCode(stu.program_id, stu.institute_id)}</span>
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
                          onClick={() => setDeletingUser({ id: stu.student_id || stu.id || stu.enrollment_no, name: `${stu.first_name || ''} ${stu.last_name || ''}` })}
                          className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
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
                  <p className="text-[11px] font-semibold text-[#64748B]">
                    Institute: <span className="text-[#1E293B] font-bold">{getInstituteCode(viewStudent.institute_id)}</span> • Dept: <span className="text-[#2563EB] font-bold">{getDepartmentCode(viewStudent.program_id, viewStudent.institute_id)}</span>
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewStudent.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-200 text-gray-600"}`}>
                      {viewStudent.is_active ? "Active Student" : "Inactive Account"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#14B8A6]/10 text-[#14B8A6] text-[10px] font-bold">
                      {getSemesterLabel(viewStudent.semester_id)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Assigned Institute</span>
                  <p className="font-bold text-[#1E293B]">{getInstituteName(viewStudent.institute_id)} ({getInstituteCode(viewStudent.institute_id)})</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Assigned Department</span>
                  <p className="font-bold text-[#2563EB]">{getDepartmentName(viewStudent.program_id, viewStudent.institute_id)} ({getDepartmentCode(viewStudent.program_id, viewStudent.institute_id)})</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Current Semester</span>
                  <p className="font-bold text-[#14B8A6]">{getSemesterLabel(viewStudent.semester_id)}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Student ID</span>
                  <p className="font-mono font-bold text-[#1E293B]">{viewStudent.student_id}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Institutional Email</span>
                  <p className="font-medium text-[#2563EB] truncate">{viewStudent.email}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Personal Phone</span>
                  <p className="font-mono text-[#1E293B] font-bold">{viewStudent.mobile}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Gender & Date of Birth</span>
                  <p className="font-medium text-[#1E293B]">{viewStudent.gender} • {viewStudent.date_of_birth}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Blood Group</span>
                  <p className="font-bold text-[#EF4444]">{viewStudent.blood_group || "O+"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Admission Date</span>
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
                <span className="text-[10px] text-[#64748B] font-bold block uppercase">Residential Address</span>
                <p className="font-medium text-[#1E293B]">{viewStudent.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editStudent ? "Edit Complete Student Information" : "Add New Student Record"}
            </h3>
            <form onSubmit={handleSaveStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Institute</label>
                <select
                  value={studentForm.institute_id || ""}
                  onChange={(e) => {
                    const instId = e.target.value;
                    const defaultProg = programs.find((p) => (p.institute_id || p.instituteId) === instId)?.department_id || "prog-001";
                    setStudentForm({ ...studentForm, institute_id: instId, program_id: defaultProg });
                  }}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-semibold text-[#1E293B]"
                >
                  {institutes.map((inst) => (
                    <option key={inst.institute_id || inst.id} value={inst.institute_id || inst.id}>
                      {inst.institute_code || inst.code} - {inst.institute_name || inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Department / Program</label>
                <select
                  value={studentForm.program_id || ""}
                  onChange={(e) => {
                    const selectedProgId = e.target.value;
                    const availSems = getAvailableSemestersForDepartment(selectedProgId);
                    const defaultSemId = availSems.length > 0 ? (availSems[0].semester_id || availSems[0].id) : "";
                    setStudentForm({
                      ...studentForm,
                      program_id: selectedProgId,
                      semester_id: defaultSemId,
                    });
                  }}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-semibold text-[#2563EB]"
                >
                  {programs
                    .filter((p) => !studentForm.institute_id || (p.institute_id || p.instituteId) === studentForm.institute_id)
                    .map((prog) => (
                      <option key={prog.department_id || prog.program_id || prog.id} value={prog.department_id || prog.program_id || prog.id}>
                        {prog.department_code || prog.program_code || prog.code} - {prog.department_name || prog.program_name || prog.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Enrolled Semester</label>
                <select
                  value={studentForm.semester_id || ""}
                  onChange={(e) => setStudentForm({ ...studentForm, semester_id: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-semibold text-[#14B8A6]"
                >
                  {getAvailableSemestersForDepartment(studentForm.program_id).map((sem) => (
                    <option key={sem.semester_id || sem.id} value={sem.semester_id || sem.id}>
                      {sem.semester_name || `Semester ${sem.semester_number || sem.number}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Enrollment No</label>
                <input
                  type="text"
                  required
                  value={studentForm.enrollment_no}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollment_no: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono font-bold text-[#2563EB]"
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
                <label className="block text-[#64748B] mb-1 font-semibold">Student Email</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Student Mobile</label>
                <input
                  type="text"
                  required
                  value={studentForm.mobile}
                  onChange={(e) => setStudentForm({ ...studentForm, mobile: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono"
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

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Blood Group</label>
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
                <label className="block text-[#64748B] mb-1 font-semibold">Admission Date</label>
                <input
                  type="date"
                  required
                  value={studentForm.admission_date}
                  onChange={(e) => setStudentForm({ ...studentForm, admission_date: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Parent Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.parent_name}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Parent Mobile</label>
                <input
                  type="text"
                  required
                  value={studentForm.parent_mobile}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_mobile: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Parent Email</label>
                <input
                  type="email"
                  value={studentForm.parent_email}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
                  placeholder="parent@gmail.com"
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#64748B] mb-1 font-semibold">Upload Profile Photo</label>
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
                <label className="block text-[#64748B] mb-1 font-semibold">Residential Address</label>
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
                  Account Active Status
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Delete Student Record"
        message={`Are you sure you want to delete student "${deletingUser?.name || 'this record'}"? This action cannot be undone.`}
        confirmText="Delete Record"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default StudentManagement;
export { StudentManagement as AdminStudentManagement };
