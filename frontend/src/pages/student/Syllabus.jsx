import React, { useState, useEffect } from "react";
import { BookOpen, FileDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { studentApi, fileApi } from "../../services/api";

const StudentSyllabus = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        setLoading(true);
        const data = await studentApi.getSyllabus();
        if (Array.isArray(data)) {
          setSubjects(data);
        }
      } catch (err) {
        console.error("Syllabus load error:", err);
        setError("Failed to load syllabus data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, []);

  const handleDownloadPdf = async (fileUrl, title) => {
    try {
      const blob = await fileApi.getFileBlob(fileUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Syllabus.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download syllabus PDF error:", e);
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Course Syllabus</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Curriculum Breakdown & Scoped Subject Modules</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
          <span>{subjects.length} Enrolled Subjects</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
          Loading course syllabus data...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
          No subjects found for your current academic batch.
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject) => {
            const hasUnits = Array.isArray(subject.units) && subject.units.length > 0;
            const hasSyllabus = subject.has_syllabus || hasUnits || !!subject.file_url;

            return (
              <div
                key={subject.subject_id || subject.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold">
                        {subject.subject_code}
                      </span>
                      {hasSyllabus ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Not uploaded yet
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-[#1E293B] mt-1">{subject.subject_name}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-lg text-xs font-bold self-start sm:self-auto">
                      {subject.credits != null ? subject.credits : 3} Semester Credits
                    </span>
                    {subject.file_url && (
                      <button
                        onClick={() => handleDownloadPdf(subject.file_url, subject.subject_name)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#2563EB] text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                {hasUnits ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {subject.units.map((unit, uIdx) => (
                      <div key={unit.id || uIdx} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#1E293B]">
                            Unit {unit.unit_number || uIdx + 1}: {unit.title}
                          </h4>
                        </div>
                        {unit.topics && (
                          <p className="text-[11px] font-medium text-[#2563EB]">
                            Topics: {unit.topics}
                          </p>
                        )}
                        <p className="text-[11px] text-[#64748B]">
                          {unit.description || "No description provided."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1] text-center">
                    <p className="text-xs font-medium text-[#64748B]">
                      Syllabus content has not been uploaded by the faculty yet for this subject.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSyllabus;
