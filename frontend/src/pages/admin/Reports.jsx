import React, { useState, useEffect } from "react";
import {
  BarChart3, Download, Printer, CheckCircle2, Users, GraduationCap,
  Award, AlertTriangle, TrendingUp, BookOpen, Search, FileText, CheckCircle,
  ChevronDown, ChevronUp, Eye, UserCheck, XCircle, Loader2, X, Building2, Phone, Mail, MapPin
} from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";
import { useBatch } from "../../context/BatchContext";

const AdminReports = () => {
  const { selectedBatch, batches = [] } = useBatch();
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedBatchId, setSelectedBatchId] = useState(() => {
    return selectedBatch?.batch_id || selectedBatch?.batchId || selectedBatch?.id || "all";
  });
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportMsg, setExportMsg] = useState(false);
  const [expandedResultId, setExpandedResultId] = useState(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync selectedBatchId if active context batch changes
  useEffect(() => {
    if (selectedBatch) {
      const bId = selectedBatch.batch_id || selectedBatch.batchId || selectedBatch.id;
      if (bId) {
        setSelectedBatchId(String(bId));
      }
    }
  }, [selectedBatch]);

  // Real Database Report Data States
  const [reportsData, setReportsData] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    avgAttendanceRate: "0.0%",
    passPercentage: "0.0%",
    avgSGPA: 0,
    avgCGPA: 0,
    atRiskStudentsCount: 0,
    studentsAttendance: [],
    semesterResults: [],
    semesterResultDetails: [],
    weeklyExams: [],
    weeklyExamResults: [],
  });

  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [reportsRes, progsRes, semsRes, subsRes] = await Promise.all([
          adminApi.getReports(),
          adminApi.getDepartments(),
          adminApi.getSemesters(),
          adminApi.getSubjects(),
        ]);

        if (reportsRes) {
          setReportsData({
            totalStudents: reportsRes.totalStudents || 0,
            totalFaculty: reportsRes.totalFaculty || 0,
            totalSubjects: reportsRes.totalSubjects || 0,
            avgAttendanceRate: reportsRes.avgAttendanceRate || "0.0%",
            passPercentage: reportsRes.passPercentage || "0.0%",
            avgSGPA: reportsRes.avgSGPA || 0,
            avgCGPA: reportsRes.avgCGPA || 0,
            atRiskStudentsCount: reportsRes.atRiskStudentsCount || 0,
            studentsAttendance: Array.isArray(reportsRes.studentsAttendance) ? reportsRes.studentsAttendance : [],
            semesterResults: Array.isArray(reportsRes.semesterResults) ? reportsRes.semesterResults : [],
            semesterResultDetails: Array.isArray(reportsRes.semesterResultDetails) ? reportsRes.semesterResultDetails : [],
            weeklyExams: Array.isArray(reportsRes.weeklyExams) ? reportsRes.weeklyExams : [],
            weeklyExamResults: Array.isArray(reportsRes.weeklyExamResults) ? reportsRes.weeklyExamResults : [],
          });
        }

        setPrograms(Array.isArray(progsRes) ? progsRes : []);
        setSemesters(Array.isArray(semsRes) ? semsRes : []);
        setSubjects(Array.isArray(subsRes) ? subsRes : []);
      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const studentsAttendance = reportsData.studentsAttendance;
  const semesterResults = reportsData.semesterResults;
  const semesterResultDetails = reportsData.semesterResultDetails;
  const weeklyExams = reportsData.weeklyExams;
  const weeklyExamResults = reportsData.weeklyExamResults;

  // Real CSV Export File Download Functionality
  const handleExportCSV = () => {
    let csvContent = "";
    let filename = "";

    if (activeTab === "attendance") {
      filename = `Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "Enrollment No,Student Name,Total Sessions,Attended,Absent,Attendance %,Status\n";
      filteredAttendance.forEach((s) => {
        const name = `"${s.first_name || "Student"} ${s.last_name || ""}"`.trim();
        csvContent += `${s.enrollment_no || ""},${name},${s.totalSessions || 0},${s.attendedSessions || 0},${s.absentSessions || 0},${s.percentage || 0}%,${s.status || ""}\n`;
      });
    } else {
      filename = `Weekly_Tests_Report_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "Assessment Title,Student Name,Enrollment No,Exam Date,Total Marks,Obtained Marks,Score %,Grade,Faculty Remarks\n";
      filteredWeeklyResults.forEach((wer) => {
        const testId = wer.weekly_test_id || wer.weekly_exam_id;
        const exam = weeklyExams.find((w) => (w.weekly_test_id || w.weekly_exam_id || w.id) === testId);
        const stu = studentsAttendance.find((s) => (s.student_id || s.id) === wer.student_id || (s.enrollment_no || s.enrollmentNo) === wer.enrollment_no);
        const title = `"${exam?.title || "Weekly Assessment"}"`;
        const name = stu ? `"${stu.first_name || "Student"} ${stu.last_name || ""}"`.trim() : `"Student"`;
        const percentage = exam && exam.total_marks ? ((wer.obtained_marks / exam.total_marks) * 100).toFixed(1) : 0;
        csvContent += `${title},${name},${stu?.enrollment_no || wer.enrollment_no || ""},${exam?.test_date || ""},${exam?.total_marks || 25},${wer.obtained_marks || 0},${percentage}%,${wer.grade || ""},"${wer.remarks || ""}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMsg(`Exported ${activeTab.replace("_", " ").toUpperCase()} as ${filename}`);
    setTimeout(() => setExportMsg(false), 3500);
  };

  // Filter available semesters based on selected Department
  const availableSemesters = selectedProgram === "all"
    ? semesters
    : semesters.filter((s) => {
      const sDept = String(s.department_id || s.departmentId || s.program_id || s.id || "");
      return sDept === String(selectedProgram);
    });

  const handleDepartmentChange = (deptId) => {
    setSelectedProgram(deptId);
    if (deptId !== "all") {
      const validSems = semesters.filter((s) => {
        const sDept = String(s.department_id || s.departmentId || s.program_id || s.id || "");
        return sDept === String(deptId);
      });
      const isValid = validSems.some((s) => String(s.semester_id || s.id) === String(selectedSemester));
      if (!isValid) {
        setSelectedSemester("all");
      }
    }
  };

  // Filter students attendance records
  const filteredAttendance = studentsAttendance.filter((stu) => {
    const query = searchQuery.trim().toLowerCase();
    const enrollment = (stu.enrollment_no || stu.enrollmentNo || "").toLowerCase();
    const fullName = `${stu.first_name || ""} ${stu.last_name || ""}`.toLowerCase();
    const matchesSearch = query === "" || enrollment.includes(query) || fullName.includes(query);

    const stuDept = String(stu.department_id || stu.departmentId || "");
    const deptMatch = selectedProgram === "all" || !stuDept || stuDept === String(selectedProgram);

    const stuSem = String(stu.semester_id || stu.semesterId || "");
    const semMatch = selectedSemester === "all" || !stuSem || stuSem === String(selectedSemester);

    const stuBatch = String(stu.batch_id || stu.batchId || "");
    const batchMatch = selectedBatchId === "all" || !stuBatch || stuBatch === String(selectedBatchId);

    return matchesSearch && deptMatch && semMatch && batchMatch;
  });

  // Filter weekly test results
  const filteredWeeklyResults = weeklyExamResults.filter((wer) => {
    const stu = studentsAttendance.find((s) => (s.student_id || s.id) === wer.student_id || (s.enrollment_no || s.enrollmentNo) === wer.enrollment_no);
    const query = searchQuery.trim().toLowerCase();
    const enrollment = (stu?.enrollment_no || wer?.enrollment_no || "").toLowerCase();
    const fullName = `${stu?.first_name || ""} ${stu?.last_name || ""}`.toLowerCase();
    const matchesSearch = query === "" || enrollment.includes(query) || fullName.includes(query);

    const stuDept = String(stu?.department_id || stu?.departmentId || wer?.department_id || "");
    const deptMatch = selectedProgram === "all" || !stuDept || stuDept === String(selectedProgram);

    const stuSem = String(stu?.semester_id || stu?.semesterId || wer?.semester_id || "");
    const semMatch = selectedSemester === "all" || !stuSem || stuSem === String(selectedSemester);

    const stuBatch = String(stu?.batch_id || stu?.batchId || wer?.batch_id || "");
    const batchMatch = selectedBatchId === "all" || !stuBatch || stuBatch === String(selectedBatchId);

    return matchesSearch && deptMatch && semMatch && batchMatch;
  });

  // Batch Specific Calculated KPI metrics
  const displayTotalStudents = selectedBatchId !== "all" || selectedProgram !== "all" || selectedSemester !== "all"
    ? filteredAttendance.length
    : (reportsData.totalStudents || studentsAttendance.length);

  const filteredAtRiskCount = filteredAttendance.filter(s => s.status === "At-Risk").length;
  
  const displayAvgAttendance = filteredAttendance.length > 0
    ? (filteredAttendance.reduce((acc, curr) => acc + (parseFloat(curr.percentage) || 0), 0) / filteredAttendance.length).toFixed(1) + "%"
    : reportsData.avgAttendanceRate;

  // Particular Student Match logic if user searches enrollment number / name
  const isSearchActive = searchQuery.trim().length > 0;
  const particularStudent = isSearchActive
    ? studentsAttendance.find(s => {
      const enrollment = (s.enrollment_no || s.enrollmentNo || "").toLowerCase();
      const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      return enrollment === searchQuery.trim().toLowerCase() || fullName.includes(searchQuery.trim().toLowerCase());
    }) || (filteredAttendance.length === 1 ? filteredAttendance[0] : null)
    : null;

  const particularStudentResult = particularStudent
    ? semesterResults.find(r => r.student_id === particularStudent.student_id || r.enrollment_no === particularStudent.enrollment_no)
    : null;

  const particularStudentTest = particularStudent
    ? weeklyExamResults.find(w => w.student_id === particularStudent.student_id)
    : null;

  return (
    <div className="space-y-5 text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#1E293B] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2563EB]" /> Reports & Analytics
          </h1>
        </div>
      </div>

      {/* Toast Alert on Export */}
      {exportMsg && (
        <div className="p-2.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[11px] font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {exportMsg}
        </div>
      )}

      {/* Top Institutional Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Overall Attendance Rate */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Overall Attendance</span>
            <div className="p-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-[#1E293B]">{displayAvgAttendance}</span>

          </div>
          <p className="text-[10px] text-[#64748B]">
            {filteredAtRiskCount > 0 ? (
              <span className="text-[#EF4444] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {filteredAtRiskCount} student(s) at-risk (&lt;75%)
              </span>
            ) : (
              ""
            )}
          </p>
        </div>

        {/* KPI 2: Overall Pass Rate */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Exam Pass Rate</span>
            <div className="p-1.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-[#1E293B]">{reportsData.passPercentage}</span>
            <span className="text-[10px] font-bold text-[#22C55E]">
              {semesterResults.filter(r => (r.result_status || "").toUpperCase() === "PASS").length}/{semesterResults.length || 1} Passed
            </span>
          </div>

        </div>

        {/* KPI 4: Active Enrolled Students */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Enrolled Students</span>
            <div className="p-1.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-[#1E293B]">{displayTotalStudents} Enrolled</span>
            <span className="text-[10px] font-bold text-[#64748B]">{reportsData.totalFaculty} Faculty</span>
          </div>

        </div>
      </div>

      {/* Category Tabs Container */}
      <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F0] shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "attendance"
            ? "bg-[#2563EB] text-white shadow-xs"
            : "bg-[#F8FAFC] text-[#64748B] hover:bg-gray-100 border border-[#E2E8F0]"
            }`}
        >
          <Users className="w-4 h-4" /> Attendance Report
        </button>

        <button
          onClick={() => setActiveTab("weekly_tests")}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "weekly_tests"
            ? "bg-[#2563EB] text-white shadow-xs"
            : "bg-[#F8FAFC] text-[#64748B] hover:bg-gray-100 border border-[#E2E8F0]"
            }`}
        >
          <FileText className="w-4 h-4" /> Weekly Tests & Marks
        </button>
      </div>

      {/* Controls Toolbar: Batch, Department, Semester & Search Box Side-by-Side */}
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center gap-3">
        {/* Batch Selection */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[#64748B] whitespace-nowrap">Batch:</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#1E293B] focus:outline-hidden focus:border-[#2563EB] cursor-pointer"
          >
            <option value="all">All Batches ({batches.length})</option>
            {batches.map((b) => (
              <option key={b.batch_id || b.batchId || b.id} value={b.batch_id || b.batchId || b.id}>
                {b.batch_name || b.batchName || b.name || "Batch"} {b.is_active || b.isActive ? "(Active)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Department Selection */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[#64748B] whitespace-nowrap">Department:</label>
          <select
            value={selectedProgram}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#1E293B] focus:outline-hidden focus:border-[#2563EB] cursor-pointer"
          >
            <option value="all">All Departments ({programs.length})</option>
            {programs.map((prog) => (
              <option key={prog.department_id || prog.id} value={prog.department_id || prog.id}>
                {prog.department_code || prog.code} - {prog.department_name || prog.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Selection */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[#64748B] whitespace-nowrap">Semester:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#1E293B] focus:outline-hidden focus:border-[#2563EB] cursor-pointer"
          >
            <option value="all">All Semesters ({availableSemesters.length})</option>
            {availableSemesters.map((sem) => (
              <option key={sem.semester_id || sem.id} value={sem.semester_id || sem.id}>
                {sem.semester_name || `Semester ${sem.semester_number || sem.number}`}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input Box */}
        <div className="relative min-w-[240px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Enrollment No or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white text-xs font-medium text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Particular Student Specific Dedicated Report Card */}
      {particularStudent && (
        <div className="bg-white rounded-xl border border-[#2563EB]/30 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 transition-all animate-fade-in text-xs">
          <div className="flex items-center gap-3">
            {particularStudent.profile_photo ? (
              <img
                src={particularStudent.profile_photo}
                alt={particularStudent.first_name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#2563EB]/20 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 text-[#2563EB] font-bold text-base flex items-center justify-center shrink-0">
                {(particularStudent.first_name || "S")[0]}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#1E293B]">
                  {particularStudent.first_name} {particularStudent.last_name}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#2563EB] text-white text-[10px] font-mono font-bold">
                  {particularStudent.enrollment_no}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5 font-medium">
                {particularStudent.email || "student@educonnect.ac.in"} • Mobile: {particularStudent.mobile || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0]">
            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
              <div className="px-1.5">
                <span className="text-[9px] text-[#64748B] font-bold block uppercase">Attendance</span>
                <span className="text-xs font-extrabold text-[#2563EB]">
                  {particularStudent.percentage !== undefined ? `${particularStudent.percentage}%` : "N/A"}
                </span>
              </div>
              <div className="px-1.5 border-x border-gray-200">
                <span className="text-[9px] text-[#64748B] font-bold block uppercase">SGPA / CGPA</span>
                <span className="text-xs font-extrabold text-[#14B8A6]">
                  {particularStudentResult ? `${particularStudentResult.sgpa} / ${particularStudentResult.cgpa}` : "N/A"}
                </span>
              </div>
              <div className="px-1.5">
                <span className="text-[9px] text-[#64748B] font-bold block uppercase">Weekly Score</span>
                <span className="text-xs font-extrabold text-[#22C55E]">
                  {particularStudentTest ? `${particularStudentTest.obtained_marks}/25` : "N/A"}
                </span>
              </div>
            </div>

            <Button
              variant="accent"
              size="sm"
              icon={Eye}
              onClick={() => setSelectedStudentForProfile(particularStudent)}
              className="text-[11px] bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold shadow-xs shrink-0 whitespace-nowrap px-3 py-1.5"
            >
              View Profile
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area based on Active Tab */}

      {/* TAB 1: ATTENDANCE REPORT */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              <h2 className="text-xs font-bold text-[#1E293B]">
                {isSearchActive ? "Filtered Student Attendance Report" : "Student Attendance Summary"}
              </h2>
              <p className="text-[10px] text-[#64748B]">
                Attendance metrics calculated from database recorded lecture sessions
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[11px]">
              {filteredAttendance.length} Student Record(s)
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#64748B]">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Calculating real attendance data from database...</span>
              </div>
            </div>
          ) : filteredAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <tr>
                    <th className="p-3">Enrollment No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Total Lectures</th>
                    <th className="p-3">Attended</th>
                    <th className="p-3">Absent</th>
                    <th className="p-3">Attendance %</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                  {filteredAttendance.map((stu) => (
                    <tr key={stu.student_id || stu.enrollment_no} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#2563EB]">{stu.enrollment_no}</td>
                      <td className="p-3 font-semibold">
                        {stu.first_name} {stu.last_name}
                      </td>
                      <td className="p-3 font-medium">{stu.totalSessions || 0}</td>
                      <td className="p-3 font-bold text-[#2563EB]">{stu.attendedSessions || 0}</td>
                      <td className="p-3 font-medium text-[#EF4444]">{stu.absentSessions || 0}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${stu.percentage >= 85
                                ? "bg-[#22C55E]"
                                : stu.percentage >= 75
                                  ? "bg-[#F59E0B]"
                                  : "bg-[#EF4444]"
                                }`}
                              style={{ width: `${Math.min(100, stu.percentage || 0)}%` }}
                            ></div>
                          </div>
                          <span className="font-extrabold text-[11px]">{stu.percentage || 0}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${stu.status === "Good"
                            ? "bg-[#22C55E]/10 text-[#22C55E]"
                            : stu.status === "Average"
                              ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                              : "bg-[#EF4444]/10 text-[#EF4444]"
                            }`}
                        >
                          {stu.status === "Good" && <CheckCircle className="w-3 h-3" />}
                          {stu.status === "Average" && <TrendingUp className="w-3 h-3" />}
                          {stu.status === "At-Risk" && <AlertTriangle className="w-3 h-3" />}
                          {stu.status || "Good"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedStudentForProfile(stu)}
                          className="px-2 py-1 rounded-md border border-[#E2E8F0] hover:bg-[#2563EB] hover:text-white text-[#2563EB] font-bold text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B] space-y-1.5">
              <Search className="w-6 h-6 text-gray-300 mx-auto" />
              <p className="font-bold text-[#1E293B]">No student attendance record found</p>
              <p className="text-[11px]">No matching records found in database.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEEKLY TESTS & MARKS */}
      {activeTab === "weekly_tests" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              <h2 className="text-xs font-bold text-[#1E293B]">
                {isSearchActive ? "Filtered Weekly Test Reports" : "Weekly Tests & Internal Evaluation Reports"}
              </h2>
              <p className="text-[10px] text-[#64748B]">Continuous evaluations and faculty awarded test scores</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] font-bold text-[11px]">
              {filteredWeeklyResults.length} Test Result(s)
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#64748B]">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Fetching weekly test evaluations from database...</span>
              </div>
            </div>
          ) : filteredWeeklyResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <tr>
                    <th className="p-3">Assessment Title</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Enrollment No</th>
                    <th className="p-3">Exam Date</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Obtained Marks</th>
                    <th className="p-3">Score %</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Faculty Remarks</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                  {filteredWeeklyResults.map((wer, idx) => {
                    const testId = wer.weekly_test_id || wer.weekly_exam_id;
                    const exam = weeklyExams.find(w => (w.weekly_test_id || w.weekly_exam_id || w.id) === testId);
                    const stu = studentsAttendance.find(s => (s.student_id || s.id) === wer.student_id || s.enrollment_no === wer.enrollment_no);
                    const percentage = exam && exam.total_marks ? ((wer.obtained_marks / exam.total_marks) * 100).toFixed(1) : 0;

                    return (
                      <tr key={wer.weekly_test_result_id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-[#1E293B]">
                          {exam?.title || "Weekly Assessment"}
                        </td>
                        <td className="p-3 font-medium">{stu ? `${stu.first_name} ${stu.last_name || ""}` : "Student"}</td>
                        <td className="p-3 font-mono font-bold text-[#2563EB]">{stu?.enrollment_no || wer.enrollment_no || "N/A"}</td>
                        <td className="p-3 font-mono text-[#64748B]">{exam?.test_date || exam?.exam_date || "N/A"}</td>
                        <td className="p-3 font-medium">{exam?.total_marks || 25}</td>
                        <td className="p-3 font-bold text-[#2563EB]">{wer.obtained_marks}</td>
                        <td className="p-3 font-extrabold text-[#22C55E]">{percentage}%</td>
                        <td className="p-3 font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] text-[10px]">
                            {wer.grade || "A"}
                          </span>
                        </td>
                        <td className="p-3 text-[#64748B] max-w-xs truncate">{wer.remarks || "Evaluated"}</td>
                        <td className="p-3 text-center">
                          {stu && (
                            <button
                              onClick={() => setSelectedStudentForProfile(stu)}
                              className="px-2 py-1 rounded-md border border-[#E2E8F0] hover:bg-[#2563EB] hover:text-white text-[#2563EB] font-bold text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Profile
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B] space-y-1.5">
              <Search className="w-6 h-6 text-gray-300 mx-auto" />
              <p className="font-bold text-[#1E293B]">No weekly test evaluation records found</p>
              <p className="text-[11px]">No weekly test records found in database.</p>
            </div>
          )}
        </div>
      )}

      {/* FULL STUDENT PROFILE DETAILS MODAL */}
      {selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B]">Official Student Profile Details</h3>
                  <p className="text-[11px] text-[#64748B]">Complete academic & personal profile overview</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForProfile(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 space-y-3 text-xs grow">
              {/* Student Header Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                {selectedStudentForProfile.profile_photo ? (
                  <img
                    src={selectedStudentForProfile.profile_photo}
                    alt={selectedStudentForProfile.first_name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#2563EB]/30 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#2563EB]/10 text-[#2563EB] font-bold text-xl flex items-center justify-center shrink-0">
                    {(selectedStudentForProfile.first_name || "S")[0]}
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left space-y-0.5">
                  <h4 className="text-base font-extrabold text-[#1E293B]">
                    {selectedStudentForProfile.first_name} {selectedStudentForProfile.last_name}
                  </h4>
                  <p className="font-mono text-[#2563EB] font-bold text-xs">
                    Enrollment No: {selectedStudentForProfile.enrollment_no}
                  </p>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    Department of Computer Applications • Active Enrolled Student
                  </p>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">Email Address</span>
                  <p className="font-medium text-[#1E293B] truncate">{selectedStudentForProfile.email || "N/A"}</p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">Mobile Number</span>
                  <p className="font-mono text-[#1E293B] font-bold">{selectedStudentForProfile.mobile || "N/A"}</p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">Gender & Date of Birth</span>
                  <p className="font-medium text-[#1E293B]">{selectedStudentForProfile.gender || "N/A"} • {selectedStudentForProfile.date_of_birth || "N/A"}</p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">Blood Group</span>
                  <p className="font-medium text-[#1E293B]">Blood Group: {selectedStudentForProfile.blood_group || "O+"}</p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5 sm:col-span-2">
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">Parent / Guardian Information</span>
                  <p className="font-bold text-[#1E293B]">{selectedStudentForProfile.parent_name || "N/A"}</p>
                  <p className="font-mono text-[#14B8A6] font-bold">{selectedStudentForProfile.parent_mobile || "N/A"} • {selectedStudentForProfile.parent_email || "N/A"}</p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-0.5 sm:col-span-2">
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">Residential Address</span>
                  <p className="font-medium text-[#1E293B]">{selectedStudentForProfile.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-[#E2E8F0] shrink-0">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudentForProfile(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
