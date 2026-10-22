import React, { useState, useEffect } from "react";
import { Users, Eye, X, GraduationCap, Search, SlidersHorizontal, RotateCcw, Filter, CalendarRange } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi, adminApi } from "../../services/api";
import { useBatch } from "../../context/BatchContext";

const TeacherManageStudents = () => {
  const { selectedBatch, batches } = useBatch();
  const activeBatch = selectedBatch || batches.find((b) => b.is_active === true || b.isActive === true) || batches[0];
  const activeBatchId = activeBatch ? String(activeBatch.batch_id || activeBatch.batchId || activeBatch.id) : null;

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [viewStudent, setViewStudent] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedSem, setSelectedSem] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentData, deptData, semData] = await Promise.all([
          teacherApi.getStudents(),
          teacherApi.getDepartments(),
          teacherApi.getSemesters(),
        ]);

        if (Array.isArray(studentData)) {
          setStudents(studentData);
        }
        if (Array.isArray(deptData)) {
          setDepartments(deptData);
        }
        if (Array.isArray(semData)) {
          setSemesters(semData);
        }
      } catch (err) {
        console.error("Teacher students load error:", err);
      }
    };
    fetchData();
  }, []);

  // Filter students belonging to the currently selected batch
  const batchStudents = students.filter((stu) => {
    if (!activeBatchId) return true;
    const stuBatchId = String(stu.batch_id || stu.batchId || "");
    return stuBatchId === activeBatchId;
  });

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDept("all");
    setSelectedSem("all");
    setSelectedGender("all");
    setSelectedStatus("all");
  };

  // Filter semesters belonging to selected department
  const availableSemesters = semesters.filter((sem) => {
    if (selectedDept === "all") return true;
    const semDeptId = sem.department_id || sem.departmentId;
    if (!semDeptId) return true;
    return String(semDeptId) === String(selectedDept);
  });

  const handleDepartmentChange = (e) => {
    setSelectedDept(e.target.value);
    setSelectedSem("all"); // Reset semester filter when department changes
  };

  // Filter logic across search, department, semester, gender, and status within the active batch
  const filteredStudents = batchStudents.filter((stu) => {
    // 1. Text Search Filter
    const query = searchTerm.toLowerCase();
    const fullName = `${stu.first_name || ""} ${stu.last_name || ""}`.toLowerCase();
    const enrollment = (stu.enrollment_no || "").toLowerCase();
    const email = (stu.email || "").toLowerCase();
    const mobile = (stu.mobile || "").toLowerCase();
    const matchesSearch =
      fullName.includes(query) || enrollment.includes(query) || email.includes(query) || mobile.includes(query);

    // 2. Department Filter
    const matchesDept =
      selectedDept === "all" ||
      (stu.department_id && String(stu.department_id) === String(selectedDept)) ||
      (stu.department_name && stu.department_name.toLowerCase().includes(selectedDept.toLowerCase()));

    // 3. Semester Filter
    const matchesSem =
      selectedSem === "all" ||
      (stu.semester_id && String(stu.semester_id) === String(selectedSem));

    // 4. Gender Filter
    const matchesGender =
      selectedGender === "all" || (stu.gender && stu.gender.toLowerCase() === selectedGender.toLowerCase());

    // 5. Status Filter
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && (stu.is_active === true || stu.is_active === undefined)) ||
      (selectedStatus === "inactive" && stu.is_active === false);

    return matchesSearch && matchesDept && matchesSem && matchesGender && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Student Directory</h1>

        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B] font-medium">
            Showing <strong className="text-[#2563EB]">{filteredStudents.length}</strong> of {batchStudents.length} Students
          </span>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3 text-xs">
        {(searchTerm || selectedDept !== "all" || selectedSem !== "all" || selectedGender !== "all" || selectedStatus !== "all") && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-[#EF4444] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
          </button>
        )}


        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Search Student</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Name, enrollment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#2563EB] text-[#1E293B]"
              />
            </div>
          </div>

          {/* Department Filter (DB Only) */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={handleDepartmentChange}
              className="w-full p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#2563EB] text-[#1E293B]"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((dept) => {
                const id = dept.department_id || dept.id || dept.departmentId;
                const name = dept.department_name || dept.name || dept.departmentName;
                return (
                  <option key={id || name} value={id || name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Semester Filter (Filtered by Selected Department) */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
              Semester {selectedDept !== "all" ? "(Dept Filtered)" : ""}
            </label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#2563EB] text-[#1E293B]"
            >
              <option value="all">
                {selectedDept === "all"
                  ? `All Semesters (${semesters.length})`
                  : `Semesters for Dept (${availableSemesters.length})`}
              </option>
              {availableSemesters.map((sem) => {
                const id = sem.semester_id || sem.id || sem.semesterId || sem.semester_number || sem.semesterNumber;
                const name = sem.semester_name || sem.name || (sem.semester_number ? `Semester ${sem.semester_number}` : `Semester ${id}`);
                return (
                  <option key={id || name} value={id || name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#2563EB] text-[#1E293B]"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#2563EB] text-[#1E293B]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2563EB]" /> Total Filtered Students:{" "}
            <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold">
              {filteredStudents.length}
            </span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Enrollment No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5">Parent / Guardian Info</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Student Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#64748B]">
                    No student records found matching selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.student_id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#2563EB]">{stu.enrollment_no}</td>
                    <td className="p-3.5 font-bold text-[#1E293B]">
                      {stu.first_name} {stu.last_name}
                    </td>
                    <td className="p-3.5 text-[#64748B]">{stu.email}</td>
                    <td className="p-3.5 font-mono font-medium">{stu.mobile}</td>
                    <td className="p-3.5">{stu.gender}</td>
                    <td className="p-3.5 text-[#64748B]">
                      {stu.parent_name || "Guardian"} {stu.parent_mobile ? `(${stu.parent_mobile})` : ""}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${stu.is_active !== false
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}
                      >
                        {stu.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setViewStudent(stu)}
                        title="View Student Details"
                        className="p-1.5 rounded-lg text-[#2563EB] hover:bg-[#2563EB]/10 border border-[#2563EB]/20 transition-colors cursor-pointer inline-flex items-center justify-center"
                      ><Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
                    Master of Computer Applications (MCA) • Active Student Record
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
                  <p className="font-medium text-[#1E293B]">{viewStudent.gender} • {viewStudent.date_of_birth || "N/A"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Blood Group & Admission Date</span>
                  <p className="font-medium text-[#1E293B]">Blood Group: {viewStudent.blood_group || "O+"} • Adm: {viewStudent.admission_date || "2025-07-15"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Parent / Guardian Information</span>
                  <p className="font-bold text-[#1E293B]">{viewStudent.parent_name || "Parent Name"}</p>
                  <p className="font-mono text-[#14B8A6] font-bold">{viewStudent.parent_mobile || "N/A"} • {viewStudent.parent_email || "parent@gmail.com"}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">Residential Address</span>
                  <p className="font-medium text-[#1E293B]">{viewStudent.address || "N/A"}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setViewStudent(null)}>
                  Close Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManageStudents;
