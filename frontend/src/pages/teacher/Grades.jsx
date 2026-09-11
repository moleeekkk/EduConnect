import React, { useState, useEffect } from "react";
import { Award, BookOpen, CheckCircle2, Save, Layers, AlertCircle } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherGrades = () => {
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const subs = await teacherApi.getAssignedSubjects();
        if (Array.isArray(subs) && subs.length > 0) {
          setAssignedSubjects(subs);
          setSelectedSubjectId(subs[0].subject_id || subs[0].id || "");
        }
      } catch (err) {
        console.error("Error loading assigned subjects:", err);
      }
    };
    fetchAssigned();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;
    const fetchRoster = async () => {
      setLoading(true);
      try {
        const selectedSub = assignedSubjects.find(
          (s) => s.subject_id === selectedSubjectId || s.id === selectedSubjectId
        );
        const semId = selectedSub?.semester_id || "";
        const data = await teacherApi.getSemesterMarks(selectedSubjectId, semId);
        if (Array.isArray(data)) {
          setRoster(data.map((item) => ({
            ...item,
            internal_marks: item.internal_marks !== undefined ? item.internal_marks : 0,
            external_marks: item.external_marks !== undefined ? item.external_marks : 0,
          })));
        } else {
          setRoster([]);
        }
      } catch (err) {
        console.error("Error loading roster:", err);
        notifyError("Failed to load student roster for mark entry.");
        setRoster([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [selectedSubjectId, assignedSubjects]);

  const handleMarkChange = (studentId, field, val) => {
    const numVal = parseFloat(val) || 0;
    setRoster((prev) =>
      prev.map((row) => {
        if (row.student_id === studentId) {
          const internal = field === "internal_marks" ? numVal : parseFloat(row.internal_marks) || 0;
          const external = field === "external_marks" ? numVal : parseFloat(row.external_marks) || 0;
          const totalObtained = internal + external;
          const pct = totalObtained; // out of 100

          let grade = "F";
          if (pct >= 90) grade = "O";
          else if (pct >= 80) grade = "A+";
          else if (pct >= 70) grade = "A";
          else if (pct >= 60) grade = "B+";
          else if (pct >= 55) grade = "B";
          else if (pct >= 50) grade = "C";
          else if (pct >= 40) grade = "P";

          return {
            ...row,
            [field]: val,
            obtained_marks: totalObtained,
            percentage: pct,
            grade,
            result_status: pct >= 40 ? "PASS" : "FAIL",
          };
        }
        return row;
      })
    );
  };

  const handleSaveMarks = async () => {
    if (!selectedSubjectId || roster.length === 0) return;
    setSaving(true);
    try {
      const selectedSub = assignedSubjects.find(
        (s) => s.subject_id === selectedSubjectId || s.id === selectedSubjectId
      );

      const payload = {
        subject_id: selectedSubjectId,
        semester_id: selectedSub?.semester_id || null,
        marks: roster.map((r) => ({
          student_id: r.student_id,
          internal_marks: parseFloat(r.internal_marks) || 0,
          external_marks: parseFloat(r.external_marks) || 0,
          remarks: r.remarks || "",
        })),
      };

      await teacherApi.saveSemesterMarks(payload);
      notifySuccess("Semester marks saved as draft successfully!");
    } catch (err) {
      console.error("Save marks error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save semester marks.";
      notifyError(msg);
    } finally {
      setSaving(false);
    }
  };

  const selectedSubject = assignedSubjects.find(
    (s) => s.subject_id === selectedSubjectId || s.id === selectedSubjectId
  );

  return (
    <div className="space-y-6">
      {/* Header & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Semester Assessment Entry</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Enter internal and external semester marks for your allocated subjects</p>
        </div>

        {assignedSubjects.length > 0 ? (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#64748B]">Assigned Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
            >
              {assignedSubjects.map((sub) => (
                <option key={sub.subject_id || sub.id} value={sub.subject_id || sub.id}>
                  {sub.subject_name} ({sub.subject_code || "SUB"})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs font-semibold text-[#EF4444] bg-red-50 p-2 rounded-lg">
            No subjects currently assigned to you.
          </div>
        )}
      </div>

      {/* Roster & Marks Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#1E293B]">
              {selectedSubject ? `${selectedSubject.subject_name} (${selectedSubject.subject_code})` : "Student Mark Entry"}
            </h2>
          </div>
          <Button
            variant="accent"
            size="sm"
            onClick={handleSaveMarks}
            disabled={saving || roster.length === 0}
            className="flex items-center gap-1.5 text-xs"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Marks..." : "Save Draft Marks"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Enrollment No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5 w-32">Internal (Out of 40)</th>
                <th className="p-3.5 w-32">External (Out of 60)</th>
                <th className="p-3.5">Total Marks (100)</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#64748B]">Loading student roster...</td>
                </tr>
              ) : roster.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#64748B]">
                    No enrolled students found for the selected subject cohort.
                  </td>
                </tr>
              ) : (
                roster.map((row) => (
                  <tr key={row.student_id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#2563EB]">{row.enrollment_no}</td>
                    <td className="p-3.5 font-semibold text-[#1E293B]">{row.student_name}</td>
                    <td className="p-3.5">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={row.internal_marks}
                        onChange={(e) => handleMarkChange(row.student_id, "internal_marks", e.target.value)}
                        className="w-24 p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-xs"
                      />
                    </td>
                    <td className="p-3.5">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        step="0.5"
                        value={row.external_marks}
                        onChange={(e) => handleMarkChange(row.student_id, "external_marks", e.target.value)}
                        className="w-24 p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono font-bold text-xs"
                      />
                    </td>
                    <td className="p-3.5 font-bold text-sm text-[#1E293B]">{row.obtained_marks || 0} / 100</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-extrabold text-xs ${
                        row.grade === "F" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#22C55E]/10 text-[#22C55E]"
                      }`}>
                        {row.grade || "F"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.result_status === "PASS" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EF4444]/10 text-[#EF4444]"
                      }`}>
                        {row.result_status || "PASS"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherGrades;
