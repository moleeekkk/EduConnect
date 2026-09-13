import React, { useState, useEffect } from "react";
import { GraduationCap, Plus, Edit, Trash2, Eye, Calendar, Phone, Mail, MapPin, AtSign, X, Building2, Search, RotateCcw, Filter, Loader2 } from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { useBatch } from "../../context/BatchContext";
import { notifySuccess, notifyError } from "../../utils/toast";


const StudentManagement = () => {
  const { selectedBatch: globalSelectedBatch } = useBatch();
  const [students, setStudents] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Institute, Department & Semester Filter States
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [stuRes, instRes, progRes, semRes, batchRes] = await Promise.all([
        adminApi.getStudents(),
        adminApi.getInstitutes(),
        adminApi.getPrograms(),
        adminApi.getSemesters(),
        adminApi.getBatches(),
      ]);

      const instList = Array.isArray(instRes) ? instRes : [];
      const progList = Array.isArray(progRes) ? progRes : [];
      const semList = Array.isArray(semRes) ? semRes : [];
      const batchList = Array.isArray(batchRes) ? batchRes : [];

      setInstitutes(instList);
      setPrograms(progList);
      setSemesters(semList);
      setBatches(batchList);

      if (Array.isArray(stuRes)) {
        setStudents(stuRes);
      }
    } catch (err) {
      console.error("Student management load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Helper to map institute_id to Institute Name & Code
  const getInstituteName = (instId) => {
    if (!instId) return "Main Campus";
    const inst = institutes.find((i) => String(i.institute_id || i.instituteId || i.id) === String(instId) || i.institute_code === instId);
    return inst ? (inst.institute_name || inst.name) : "Main Campus";
  };

  const getInstituteCode = (instId) => {
    if (!instId) return "CA";
    const inst = institutes.find((i) => String(i.institute_id || i.instituteId || i.id) === String(instId) || i.institute_code === instId);
    return inst ? (inst.institute_code || inst.code) : "CA";
  };

  // Helper to map department_id to Department Name & Code
  const getDepartmentName = (deptId, instId) => {
    if (deptId) {
      const prog = programs.find((p) => String(p.department_id || p.departmentId || p.id) === String(deptId) || p.department_code === deptId);
      if (prog) return prog.department_name || prog.name;
    }
    return "Department of Computer Applications";
  };

  const getDepartmentCode = (deptId, instId) => {
    if (deptId) {
      const prog = programs.find((p) => String(p.department_id || p.departmentId || p.id) === String(deptId) || p.department_code === deptId);
      if (prog) return prog.department_code || prog.code;
    }
    return "MCA";
  };

  // Helper to map batch_id to Batch Name
  const getBatchName = (batchId) => {
    if (!batchId) return "Unassigned Batch";
    const batch = batches.find((b) => String(b.batch_id || b.batchId || b.id) === String(batchId));
    return batch ? (batch.batch_name || batch.batchName) : "Academic Batch";
  };

  // Helper to map semester_id to Semester Label
  const getSemesterLabel = (semId, semNo) => {
    if (!semId && !semNo) return "Semester 1";
    if (semId) {
      const sem = semesters.find(
        (s) =>
          String(s.semester_id || s.semesterId || s.id).toLowerCase() === String(semId).toLowerCase() ||
          String(s.semester_number || s.number) === String(semId)
      );
      if (sem) return sem.semester_name || `Semester ${sem.semester_number || sem.number}`;
    }
    if (semNo) {
      const sem = semesters.find((s) => String(s.semester_number || s.number) === String(semNo));
      if (sem) return sem.semester_name || `Semester ${sem.semester_number || sem.number}`;
      return `Semester ${semNo}`;
    }
    if (semId && (!isNaN(semId) && String(semId).length <= 2)) {
      return `Semester ${semId}`;
    }
    return "Semester 1";
  };

  const getAvailableSemestersForDepartment = (deptId) => {
    if (!semesters || semesters.length === 0) return [];
    if (!deptId || deptId === "all") return semesters;

    const targetDept = programs.find((p) => String(p.department_id || p.departmentId || p.id) === String(deptId) || p.department_code === deptId);
    const targetId = targetDept ? (targetDept.department_id || targetDept.departmentId || targetDept.id) : deptId;

    const filtered = semesters.filter((s) => {
      const sDept = s.department_id || s.departmentId;
      return String(sDept) === String(targetId) || String(sDept) === String(deptId);
    });

    return filtered.length > 0 ? filtered : semesters;
  };

  const availableDepartments = selectedInstitute === "all"
    ? programs
    : programs.filter((p) => String(p.institute_id || p.instituteId) === String(selectedInstitute));


  // Filtered Students Array
  const filteredStudents = students.filter((stu) => {
    const instId = stu.institute_id || stu.instituteId;
    const progId = stu.department_id || stu.departmentId;
    const semId = stu.semester_id || stu.semesterId;
    const batchId = stu.batch_id || stu.batchId;
    const activeBatchId = globalSelectedBatch?.batch_id || globalSelectedBatch?.batchId || globalSelectedBatch?.id;

    if (selectedInstitute !== "all") {
      if (instId) {
        const matchesId = String(instId) === String(selectedInstitute);
        const matchesCode = getInstituteCode(instId) === getInstituteCode(selectedInstitute);
        if (!matchesId && !matchesCode) return false;
      }
    }
    if (selectedDepartment !== "all") {
      if (progId) {
        const matchesId = String(progId) === String(selectedDepartment);
        const matchesCode = getDepartmentCode(progId) === getDepartmentCode(selectedDepartment);
        if (!matchesId && !matchesCode) return false;
      }
    }
    if (selectedSemester !== "all") {
      if (semId) {
        const matchesId = String(semId) === String(selectedSemester);
        const matchesLabel = getSemesterLabel(semId) === getSemesterLabel(selectedSemester);
        if (!matchesId && !matchesLabel) return false;
      }
    }
    if (activeBatchId) {
      if (batchId) {
        const matchesId = String(batchId) === String(activeBatchId);
        const matchesName = globalSelectedBatch?.batch_name && getBatchName(batchId) === (globalSelectedBatch.batch_name || globalSelectedBatch.batchName);
        if (!matchesId && !matchesName) return false;
      } else {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const firstName = stu.first_name || stu.firstName || "";
      const lastName = stu.last_name || stu.lastName || "";
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const enroll = (stu.enrollment_no || stu.enrollmentNo || "").toLowerCase();
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
    surname: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "",
    address: "",
    institute_id: "",
    department_id: "",
    semester_id: "",
    batch_id: "",
    blood_group: "O+",
    parent_name: "",
    parent_mobile: "",
    parent_email: "",
    admission_date: "",
    profile_photo: "",
    is_active: true,
  });

  // Departments available in student add/edit form based on selected institute
  const formAvailableDepartments = studentForm.institute_id
    ? programs.filter((p) => {
      const pInstId = p.institute_id || p.instituteId;
      if (!pInstId) return true;
      return String(pInstId) === String(studentForm.institute_id) || getInstituteCode(pInstId) === getInstituteCode(studentForm.institute_id);
    })
    : [];

  // Semesters available in student add/edit form based on selected department
  const formAvailableSemesters = studentForm.department_id
    ? getAvailableSemestersForDepartment(studentForm.department_id)
    : [];

  const handleOpenStudentAdd = () => {
    setEditStudent(null);
    const defaultInst = selectedInstitute !== "all" ? selectedInstitute : "";

    const instDepts = defaultInst
      ? programs.filter((p) => {
        const pInstId = p.institute_id || p.instituteId;
        return String(pInstId) === String(defaultInst) || getInstituteCode(pInstId) === getInstituteCode(defaultInst);
      })
      : [];

    const defaultProg = (selectedDepartment !== "all" && instDepts.some(p => String(p.department_id || p.departmentId || p.id) === String(selectedDepartment)))
      ? selectedDepartment
      : "";

    const availableSems = defaultProg ? getAvailableSemestersForDepartment(defaultProg) : [];
    const defaultSem = (selectedSemester !== "all" && availableSems.some(s => String(s.semester_id || s.semesterId || s.id) === String(selectedSemester)))
      ? selectedSemester
      : "";

    const activeBatchId = globalSelectedBatch?.batch_id || globalSelectedBatch?.batchId || globalSelectedBatch?.id;
    const defaultBatch = defaultSem && activeBatchId ? activeBatchId : "";

    setStudentForm({
      enrollment_no: "",
      first_name: "",
      last_name: "",
      surname: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "",
      address: "",
      institute_id: defaultInst,
      department_id: defaultProg,
      semester_id: defaultSem,
      batch_id: defaultBatch,
      blood_group: "O+",
      parent_name: "",
      parent_mobile: "",
      parent_email: "",
      admission_date: "",
      profile_photo: "",
      is_active: true,
    });
    setShowStudentModal(true);
  };

  const handleOpenStudentEdit = (stu) => {
    setEditStudent(stu);
    setStudentForm({
      enrollment_no: (stu.enrollment_no || stu.enrollmentNo || "").toUpperCase(),
      first_name: stu.first_name || stu.firstName || "",
      last_name: stu.last_name || stu.lastName || "",
      surname: stu.surname || "",
      email: stu.email || "",
      mobile: stu.mobile || "",
      gender: stu.gender || "Male",
      date_of_birth: stu.date_of_birth || stu.dateOfBirth || "",
      address: stu.address || "",
      institute_id: stu.institute_id || stu.instituteId || (institutes.length > 0 ? (institutes[0].institute_id || institutes[0].instituteId || institutes[0].id) : ""),
      department_id: stu.department_id || stu.departmentId || (programs.length > 0 ? (programs[0].department_id || programs[0].departmentId || programs[0].id) : ""),
      semester_id: stu.semester_id || stu.semesterId || (semesters.length > 0 ? (semesters[0].semester_id || semesters[0].semesterId || semesters[0].id) : ""),
      batch_id: stu.batch_id || stu.batchId || (batches.length > 0 ? (batches[0].batch_id || batches[0].batchId || batches[0].id) : ""),
      blood_group: stu.blood_group || stu.bloodGroup || "O+",
      parent_name: stu.parent_name || stu.parentName || "",
      parent_mobile: stu.parent_mobile || stu.parentMobile || "",
      parent_email: stu.parent_email || stu.parentEmail || "",
      admission_date: stu.admission_date || stu.admissionDate || "",
      profile_photo: stu.profile_photo || stu.profilePhoto || "",
      is_active: stu.is_active !== undefined ? stu.is_active : (stu.isActive !== undefined ? stu.isActive : true),
    });
    setShowStudentModal(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      const id = deletingUser.id || deletingUser.student_id || deletingUser.studentId;
      await adminApi.deleteStudent(id);
      notifySuccess(`Student '${deletingUser.name || "record"}' deleted successfully!`);
      await fetchAllData();
    } catch (err) {
      console.error("Delete student error:", err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to delete student";
      notifyError(`Failed to delete student record: ${serverMsg}`);
    } finally {
      setDeleting(false);
      setDeletingUser(null);
    }
  };

  const isUuid = (val) => typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
  const toValidUuidOrNull = (val) => (val && isUuid(String(val).trim())) ? String(val).trim() : null;
  const isDateStr = (val) => typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val);
  const toValidDateOrNull = (val) => (val && isDateStr(String(val).trim())) ? String(val).trim() : null;

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const todayDateStr = new Date().toISOString().split("T")[0];
    if (studentForm.date_of_birth && studentForm.date_of_birth > todayDateStr) {
      notifyError("Date of Birth cannot be in the future (after today).");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        enrollment_no: studentForm.enrollment_no && String(studentForm.enrollment_no).trim() !== ""
          ? String(studentForm.enrollment_no).trim().toUpperCase()
          : `25CI${Math.floor(10000 + Math.random() * 90000)}`,
        first_name: studentForm.first_name ? String(studentForm.first_name).trim() : "Student",
        last_name: studentForm.last_name ? String(studentForm.last_name).trim() : "",
        surname: studentForm.surname ? String(studentForm.surname).trim() : "",
        email: studentForm.email ? String(studentForm.email).trim() : `student${Math.floor(1000 + Math.random() * 9000)}@educonnect.ac.in`,
        mobile: studentForm.mobile ? String(studentForm.mobile).trim() : "",
        gender: studentForm.gender || "Male",
        date_of_birth: toValidDateOrNull(studentForm.date_of_birth),
        address: studentForm.address ? String(studentForm.address).trim() : "",
        institute_id: toValidUuidOrNull(studentForm.institute_id),
        department_id: toValidUuidOrNull(studentForm.department_id),
        semester_id: toValidUuidOrNull(studentForm.semester_id),
        batch_id: toValidUuidOrNull(studentForm.batch_id),
        parent_name: studentForm.parent_name ? String(studentForm.parent_name).trim() : "",
        parent_mobile: studentForm.parent_mobile ? String(studentForm.parent_mobile).trim() : "",
        parent_email: studentForm.parent_email ? String(studentForm.parent_email).trim() : "",
        blood_group: studentForm.blood_group || "O+",
        admission_date: toValidDateOrNull(studentForm.admission_date),
        profile_photo: studentForm.profile_photo && String(studentForm.profile_photo).trim() !== "" ? studentForm.profile_photo : null,
        is_active: Boolean(studentForm.is_active),
      };

      if (editStudent) {
        const id = editStudent.student_id || editStudent.studentId || editStudent.id;
        await adminApi.updateStudent(id, payload);
        notifySuccess(`Student '${payload.first_name} ${payload.last_name}' details updated successfully!`);
      } else {
        await adminApi.createStudent(payload);
        notifySuccess(`Student '${payload.first_name} ${payload.last_name}' added successfully to database!`);
      }
      await fetchAllData();
      setShowStudentModal(false);
    } catch (err) {
      console.error("Save student error:", err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      notifyError(`Failed to save student record: ${serverMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Student Management</h1>
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

          <div className="flex items-center gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0">
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
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Department (Semester)</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                      <span>Fetching student records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#64748B] font-medium">
                    No student records found in database. Click <strong className="text-[#2563EB]">"Add Student"</strong> to create a new record.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const sId = stu.student_id || stu.studentId || stu.id;
                  const fName = stu.first_name || stu.firstName || "Student";
                  const lName = stu.last_name || stu.lastName || "";
                  const enroll = stu.enrollment_no || stu.enrollmentNo || "N/A";
                  const progId = stu.program_id || stu.programId;
                  const semId = stu.semester_id || stu.semesterId;

                  return (
                    <tr key={sId || enroll} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">{enroll}</td>
                      <td className="p-3.5 font-semibold">{fName} {lName}</td>
                      <td className="p-3.5 font-mono">{stu.mobile || "N/A"}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-[#1E293B]">{getDepartmentCode(progId)}</span>
                        <span className="px-2 py-0.5 ml-2 rounded bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[11px]">
                          ({getSemesterLabel(semId)})
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{stu.gender || "Male"}</td>
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
                            onClick={() => setDeletingUser({ id: sId, name: `${fName} ${lName}` })}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student Details Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in text-xs">
            {/* Modal Title Bar */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B]">Student Information</h3>
                  <p className="text-xs text-[#64748B]">Complete profile details of enrolled student</p>
                </div>
              </div>
              <button
                onClick={() => setViewStudent(null)}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto pr-1 space-y-4 text-xs grow">
              {/* Profile Overview Header Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gradient-to-r from-[#F8FAFC] to-[#EFF6FF] rounded-xl border border-[#E2E8F0]">
                {viewStudent.profile_photo || viewStudent.profilePhoto ? (
                  <img
                    src={viewStudent.profile_photo || viewStudent.profilePhoto}
                    alt={viewStudent.first_name || viewStudent.firstName}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-[#2563EB]/30 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white font-extrabold text-2xl flex items-center justify-center shadow-xs shrink-0">
                    {(viewStudent.first_name || viewStudent.firstName || "S")[0]}
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-lg font-extrabold text-[#1E293B]">
                      {viewStudent.first_name || viewStudent.firstName} {viewStudent.last_name || viewStudent.lastName}
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${viewStudent.is_active !== false && viewStudent.isActive !== false ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'}`}>
                      {viewStudent.is_active !== false && viewStudent.isActive !== false ? 'Active Student' : 'Inactive'}
                    </span>
                  </div>
                  <p className="font-mono text-[#2563EB] font-bold text-xs">
                    Enrollment No: {viewStudent.enrollment_no || viewStudent.enrollmentNo || "N/A"}
                  </p>
                  <p className="text-xs text-[#64748B] font-medium">
                    {getDepartmentName(viewStudent.department_id || viewStudent.departmentId)} • {getSemesterLabel(viewStudent.semester_id || viewStudent.semesterId)}
                  </p>
                </div>
              </div>

              {/* 1. Academic Details */}
              <div>
                <h5 className="font-bold text-[#2563EB] uppercase text-[11px] mb-2 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Academic Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Institute</span>
                    <p className="font-semibold text-[#1E293B]">
                      {getInstituteCode(viewStudent.institute_id || viewStudent.instituteId)} - {getInstituteName(viewStudent.institute_id || viewStudent.instituteId)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Department</span>
                    <p className="font-semibold text-[#1E293B]">
                      {getDepartmentCode(viewStudent.department_id || viewStudent.departmentId)} - {getDepartmentName(viewStudent.department_id || viewStudent.departmentId)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Enrolled Semester</span>
                    <p className="font-semibold text-[#14B8A6]">
                      {getSemesterLabel(viewStudent.semester_id || viewStudent.semesterId)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Academic Batch</span>
                    <p className="font-semibold text-[#F59E0B]">
                      {getBatchName(viewStudent.batch_id || viewStudent.batchId)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Admission Date</span>
                    <p className="font-medium text-[#1E293B]">
                      {viewStudent.admission_date || viewStudent.admissionDate || "N/A"}
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Account Status</span>
                    <p className="font-bold text-[#1E293B]">
                      {viewStudent.is_active !== false && viewStudent.isActive !== false ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Personal Information */}
              <div>
                <h5 className="font-bold text-[#2563EB] uppercase text-[11px] mb-2 tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Personal Details
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Student Email</span>
                    <p className="font-medium text-[#1E293B]">{viewStudent.email || "N/A"}</p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Mobile Number</span>
                    <p className="font-mono text-[#1E293B] font-bold">{viewStudent.mobile || "N/A"}</p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Gender</span>
                    <p className="font-medium text-[#1E293B]">{viewStudent.gender || "N/A"}</p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Date of Birth</span>
                    <p className="font-medium text-[#1E293B]">{viewStudent.date_of_birth || viewStudent.dateOfBirth || "N/A"}</p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] sm:col-span-2">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Blood Group</span>
                    <p className="font-semibold text-[#EF4444]">{viewStudent.blood_group || viewStudent.bloodGroup || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* 3. Parent / Guardian Contact */}
              <div>
                <h5 className="font-bold text-[#2563EB] uppercase text-[11px] mb-2 tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Parent / Guardian Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Parent Name</span>
                    <p className="font-medium text-[#1E293B]">{viewStudent.parent_name || viewStudent.parentName || "N/A"}</p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Parent Mobile</span>
                    <p className="font-mono text-[#1E293B] font-bold">{viewStudent.parent_mobile || viewStudent.parentMobile || "N/A"}</p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Parent Email</span>
                    <p className="font-medium text-[#1E293B]">{viewStudent.parent_email || viewStudent.parentEmail || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* 4. Address & System Metadata */}
              <div>
                <h5 className="font-bold text-[#2563EB] uppercase text-[11px] mb-2 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Residential Address & System Metadata
                </h5>
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold block uppercase">Residential Address</span>
                    <p className="font-medium text-[#1E293B]">{viewStudent.address || "N/A"}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-bold block uppercase">Record Created At</span>
                      <p className="font-mono text-[#64748B] text-[11px]">
                        {viewStudent.created_at || viewStudent.createdAt ? new Date(viewStudent.created_at || viewStudent.createdAt).toLocaleString("en-IN") : "N/A"}
                      </p>
                    </div>
                    <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-bold block uppercase">Last Updated At</span>
                      <p className="font-mono text-[#64748B] text-[11px]">
                        {viewStudent.updated_at || viewStudent.updatedAt ? new Date(viewStudent.updated_at || viewStudent.updatedAt).toLocaleString("en-IN") : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-[#E2E8F0] shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editStudent ? "Edit Student Information" : "Add New Student Record"}
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStudent} className="flex flex-col grow overflow-hidden space-y-4">
              <div className="overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs grow">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Institute</label>
                  <select
                    value={studentForm.institute_id || ""}
                    onChange={(e) => {
                      const newInst = e.target.value;
                      setStudentForm({
                        ...studentForm,
                        institute_id: newInst,
                        program_id: "",
                        semester_id: "",
                        batch_id: "",
                      });
                    }}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg font-semibold text-[#1E293B]"
                  >
                    <option value="">-- Select Institute --</option>
                    {institutes.map((inst) => {
                      const instId = inst.institute_id || inst.instituteId || inst.id;
                      return (
                        <option key={instId} value={instId}>
                          {inst.institute_code || inst.code} - {inst.institute_name || inst.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Department</label>
                  <select
                    disabled={!studentForm.institute_id}
                    value={studentForm.department_id || ""}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setStudentForm({
                        ...studentForm,
                        department_id: newDept,
                        semester_id: "",
                        batch_id: "",
                      });
                    }}
                    className={`w-full p-2.5 border border-[#E2E8F0] rounded-lg font-semibold ${!studentForm.institute_id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#F8FAFC] focus:bg-white text-[#1E293B]"
                      }`}
                  >
                    {!studentForm.institute_id ? (
                      <option value="">-- Select Institute First --</option>
                    ) : (
                      <>
                        <option value="">-- Select Department --</option>
                        {formAvailableDepartments.length > 0 ? (
                          formAvailableDepartments.map((dept) => {
                            const dId = dept.department_id || dept.departmentId || dept.id;
                            return (
                              <option key={dId} value={dId}>
                                {dept.department_code || dept.code} - {dept.department_name || dept.name}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>No departments found for selected institute</option>
                        )}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Enrolled Semester</label>
                  <select
                    disabled={!studentForm.department_id}
                    value={studentForm.semester_id || ""}
                    onChange={(e) => {
                      const newSem = e.target.value;
                      setStudentForm({
                        ...studentForm,
                        semester_id: newSem,
                        batch_id: "",
                      });
                    }}
                    className={`w-full p-2.5 border border-[#E2E8F0] rounded-lg font-semibold ${!studentForm.department_id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#F8FAFC] focus:bg-white text-[#14B8A6]"
                      }`}
                  >
                    {!studentForm.department_id ? (
                      <option value="">-- Select Department First --</option>
                    ) : (
                      <>
                        <option value="">-- Select Semester --</option>
                        {formAvailableSemesters.map((sem) => {
                          const sId = sem.semester_id || sem.semesterId || sem.id;
                          return (
                            <option key={sId} value={sId}>
                              {sem.semester_name || `Semester ${sem.semester_number || sem.number}`}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Academic Batch</label>
                  <select
                    disabled={!studentForm.semester_id}
                    value={studentForm.batch_id || ""}
                    onChange={(e) => setStudentForm({ ...studentForm, batch_id: e.target.value })}
                    className={`w-full p-2.5 border border-[#E2E8F0] rounded-lg font-semibold ${!studentForm.semester_id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#F8FAFC] focus:bg-white text-[#F59E0B]"
                      }`}
                  >
                    {!studentForm.semester_id ? (
                      <option value="">-- Select Semester First --</option>
                    ) : (
                      <>
                        <option value="">-- Select Batch --</option>
                        {batches.map((b) => {
                          const bId = b.batch_id || b.batchId || b.id;
                          const bName = b.batch_name || b.batchName;
                          return (
                            <option key={bId} value={bId}>
                              {bName}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Enrollment No</label>
                  <input
                    type="text"
                    placeholder="e.g. 25CI211001"
                    value={studentForm.enrollment_no}
                    onChange={(e) => setStudentForm({ ...studentForm, enrollment_no: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono font-bold text-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={studentForm.first_name}
                    onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={studentForm.last_name}
                    onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Surname</label>
                  <input
                    type="text"
                    placeholder="Surname"
                    value={studentForm.surname}
                    onChange={(e) => setStudentForm({ ...studentForm, surname: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Student Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@educonnect.ac.in"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Student Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
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
                    max={new Date().toISOString().split("T")[0]}
                    value={studentForm.date_of_birth}
                    onChange={(e) => {
                      const val = e.target.value;
                      const todayDateStr = new Date().toISOString().split("T")[0];
                      if (val && val > todayDateStr) {
                        alert("Date of Birth cannot be in the future (after today).");
                        return;
                      }
                      setStudentForm({ ...studentForm, date_of_birth: val });
                    }}
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
                    value={studentForm.admission_date}
                    onChange={(e) => setStudentForm({ ...studentForm, admission_date: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Parent Name</label>
                  <input
                    type="text"
                    placeholder="Parent / Guardian Name"
                    value={studentForm.parent_name}
                    onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Parent Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
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

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[#64748B] font-semibold">Upload Profile Photo or Image URL</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Paste image URL (optional)"
                      value={studentForm.profile_photo || ""}
                      onChange={(e) => setStudentForm({ ...studentForm, profile_photo: e.target.value })}
                      className="flex-1 w-full p-2 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg text-xs"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setStudentForm({ ...studentForm, profile_photo: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full sm:w-auto p-1.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg text-xs"
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
                    placeholder="Student address"
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
                    Student Active Status
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0] shrink-0">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowStudentModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" disabled={saving}>
                  {saving ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Record...</span>
                    </div>
                  ) : (
                    "Save Student Record"
                  )}
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
