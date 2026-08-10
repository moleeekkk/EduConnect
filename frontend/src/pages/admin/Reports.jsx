import React, { useState } from "react";
import { BarChart3, Download, Printer, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import Button from "../../components/common/Button";
import { mockStudents, mockTeachers, mockAttendanceRecords, mockSemesterResults } from "../../data/mockData";

const AdminReports = () => {
  const [reportCategory, setReportCategory] = useState("Attendance");
  const [exportMsg, setExportMsg] = useState(false);

  const handleExport = () => {
    setExportMsg(true);
    setTimeout(() => setExportMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Institutional Reports & Analytics Generator</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Generate overall attendance records, examination marks, and enrolment metrics</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()} className="text-xs">
            Print Report
          </Button>
          <Button variant="accent" size="sm" icon={Download} onClick={handleExport} className="text-xs">
            Export CSV / PDF
          </Button>
        </div>
      </div>

      {exportMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {reportCategory} report exported successfully!
        </div>
      )}

      {/* Category Tabs */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center gap-2">
        {["Attendance", "Academic Results", "Student Enrolment", "Faculty Workload"].map((cat) => (
          <button
            key={cat}
            onClick={() => setReportCategory(cat)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              reportCategory === cat ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] text-[#64748B] hover:bg-gray-100"
            }`}
          >
            {cat} Report
          </button>
        ))}
      </div>

      {/* Report Data Table Preview */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#1E293B]">Generated Data Summary: {reportCategory}</h2>
        </div>

        <div className="overflow-x-auto">
          {reportCategory === "Attendance" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Enrollment No</th>
                  <th className="p-3.5">Total Sessions</th>
                  <th className="p-3.5">Sessions Attended</th>
                  <th className="p-3.5">Attendance Percentage</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {mockStudents.map((stu) => (
                  <tr key={stu.student_id}>
                    <td className="p-3.5 font-semibold">{stu.first_name} {stu.last_name}</td>
                    <td className="p-3.5 font-mono">{stu.enrollment_no}</td>
                    <td className="p-3.5">30</td>
                    <td className="p-3.5 font-bold text-[#2563EB]">27</td>
                    <td className="p-3.5 font-extrabold text-[#22C55E]">90.0%</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-bold text-[10px]">Good</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportCategory === "Academic Results" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Enrollment No</th>
                  <th className="p-3.5">SGPA (Sem 2)</th>
                  <th className="p-3.5">CGPA</th>
                  <th className="p-3.5">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {mockSemesterResults.map((res) => {
                  const stu = mockStudents.find((s) => s.student_id === res.student_id);
                  return (
                    <tr key={res.semester_result_id}>
                      <td className="p-3.5 font-semibold">{stu ? `${stu.first_name} ${stu.last_name}` : "Student"}</td>
                      <td className="p-3.5 font-mono">{stu?.enrollment_no}</td>
                      <td className="p-3.5 font-bold text-[#2563EB]">{res.sgpa}</td>
                      <td className="p-3.5 font-bold text-[#14B8A6]">{res.cgpa}</td>
                      <td className="p-3.5 font-bold text-[#22C55E]">{res.result_status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {(reportCategory === "Student Enrolment" || reportCategory === "Faculty Workload") && (
            <div className="p-6 text-center text-xs text-[#64748B]">
              <p className="font-bold text-[#1E293B]">Institutional {reportCategory} Data Generated</p>
              <p className="mt-1">All {mockStudents.length} student records and {mockTeachers.length} faculty workload parameters consolidated.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
