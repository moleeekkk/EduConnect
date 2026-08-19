import React, { useState } from "react";
import { 
  BarChart3, Download, Printer, CheckCircle2, Users, GraduationCap, 
  Award, AlertTriangle, TrendingUp, BookOpen, Search, FileText, CheckCircle, 
  ChevronDown, ChevronUp, Eye, UserCheck, XCircle, X
} from "lucide-react";
import Button from "../../components/common/Button";
import { 
  mockStudents, 
  mockSemesterResults, 
  mockSemesterResultDetails, 
  mockWeeklyExams, 
  mockWeeklyExamResults, 
  mockSubjects, 
  mockPrograms, 
  mockSemesters 
} from "../../data/mockData";

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportMsg, setExportMsg] = useState(false);
  const [expandedResultId, setExpandedResultId] = useState(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);

  const handleExport = (format) => {
    setExportMsg(`Overall ${activeTab.replace("_", " ").toUpperCase()} Report exported as ${format} successfully!`);
    setTimeout(() => setExportMsg(false), 3500);
  };

  const attendanceData = (mockStudents || []).map((stu, index) => {
    const totalSessions = 40;
    const attendedSessions = 36;
    const percentage = Number(((attendedSessions / totalSessions) * 100).toFixed(1));
    const status = percentage >= 85 ? "Good" : percentage >= 75 ? "Average" : "At-Risk";
    return {
      ...stu,
      totalSessions,
      attendedSessions,
      absentSessions: totalSessions - attendedSessions,
      percentage,
      status,
    };
  });

  const totalStudentsCount = attendanceData.length;
  const overallAvgAttendance = totalStudentsCount > 0 
    ? (attendanceData.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudentsCount).toFixed(1)
    : "0.0";
  const atRiskStudentsCount = attendanceData.filter(s => s.status === "At-Risk").length;

  const totalExamResults = (mockSemesterResults || []).length;
  const passedExamCount = (mockSemesterResults || []).filter(r => r.result_status.toLowerCase() === "pass").length;
  const passPercentage = totalExamResults > 0 ? ((passedExamCount / totalExamResults) * 100).toFixed(1) : "0.0";
  const avgSGPA = totalExamResults > 0 ? (mockSemesterResults.reduce((acc, curr) => acc + curr.sgpa, 0) / totalExamResults).toFixed(2) : "0.00";
  const avgCGPA = totalExamResults > 0 ? (mockSemesterResults.reduce((acc, curr) => acc + curr.cgpa, 0) / totalExamResults).toFixed(2) : "0.00";

  const filteredAttendance = attendanceData.filter((stu) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === "" || 
      (stu.enrollment_no && stu.enrollment_no.toLowerCase().includes(query)) ||
      `${stu.first_name || ""} ${stu.last_name || ""}`.toLowerCase().includes(query);
    return matchesSearch;
  });

  const filteredSemesterResults = (mockSemesterResults || []).filter((res) => {
    const stu = (mockStudents || []).find((s) => s.student_id === res.student_id);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === "" || (stu && (
      (stu.enrollment_no && stu.enrollment_no.toLowerCase().includes(query)) ||
      `${stu.first_name || ""} ${stu.last_name || ""}`.toLowerCase().includes(query)
    ));
    const semMatch = selectedSemester === "all" || res.semester_id === selectedSemester;
    return matchesSearch && semMatch;
  });

  const filteredWeeklyResults = (mockWeeklyExamResults || []).filter((wer) => {
    const stu = (mockStudents || []).find((s) => s.student_id === wer.student_id);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === "" || (stu && (
      (stu.enrollment_no && stu.enrollment_no.toLowerCase().includes(query)) ||
      `${stu.first_name || ""} ${stu.last_name || ""}`.toLowerCase().includes(query)
    ));
    return matchesSearch;
  });

  const isSearchActive = searchQuery.trim().length > 0;
  const particularStudent = isSearchActive 
    ? (mockStudents || []).find(s => 
        (s.enrollment_no && s.enrollment_no.toLowerCase() === searchQuery.trim().toLowerCase()) ||
        `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) || (filteredAttendance.length === 1 ? filteredAttendance[0] : null)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#2563EB]" /> Reports
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()} className="text-xs">
            Print Report
          </Button>
          <Button variant="accent" size="sm" icon={Download} onClick={() => handleExport("CSV/PDF")} className="text-xs">
            Export Report
          </Button>
        </div>
      </div>

      {exportMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {exportMsg}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Overall Attendance</span>
            <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#1E293B]">{overallAvgAttendance}%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Exam Pass Rate</span>
            <div className="p-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#1E293B]">{passPercentage}%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Average CGPA</span>
            <div className="p-2 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#1E293B]">{avgCGPA} / 10</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Enrolled Students</span>
            <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#1E293B]">{totalStudentsCount} Enrolled</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "attendance" ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] text-[#64748B]"
          }`}
        >
          <Users className="w-4 h-4" /> Attendance Report
        </button>

        <button
          onClick={() => setActiveTab("semester_results")}
          className={`py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "semester_results" ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] text-[#64748B]"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Semester Exam Results
        </button>

        <button
          onClick={() => setActiveTab("weekly_tests")}
          className={`py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "weekly_tests" ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] text-[#64748B]"
          }`}
        >
          <FileText className="w-4 h-4" /> Weekly Tests & Marks
        </button>
      </div>

      {/* Content */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {filteredAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Enrollment No</th>
                    <th className="p-3.5">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredAttendance.map((stu) => (
                    <tr key={stu.student_id}>
                      <td className="p-3.5 font-semibold">{stu.first_name} {stu.last_name}</td>
                      <td className="p-3.5 font-mono text-[#2563EB] font-bold">{stu.enrollment_no}</td>
                      <td className="p-3.5 font-extrabold">{stu.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No student attendance records found.
            </div>
          )}
        </div>
      )}

      {activeTab === "semester_results" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {filteredSemesterResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="p-3.5">SGPA</th>
                    <th className="p-3.5">CGPA</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredSemesterResults.map((res) => (
                    <tr key={res.semester_result_id}>
                      <td className="p-3.5 font-bold text-[#2563EB]">{res.sgpa}</td>
                      <td className="p-3.5 font-bold text-[#14B8A6]">{res.cgpa}</td>
                      <td className="p-3.5">{res.result_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No semester exam results found.
            </div>
          )}
        </div>
      )}

      {activeTab === "weekly_tests" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {filteredWeeklyResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="p-3.5">Obtained Marks</th>
                    <th className="p-3.5">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredWeeklyResults.map((wer) => (
                    <tr key={wer.weekly_exam_result_id}>
                      <td className="p-3.5 font-bold text-[#2563EB]">{wer.obtained_marks}</td>
                      <td className="p-3.5 font-bold text-[#22C55E]">{wer.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No weekly test reports found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
