import React, { useState } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Save, ArrowLeft, Users, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const AttendanceMarker = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("MCA301");
  const [isSaved, setIsSaved] = useState(false);

  const initialStudents = [
    { id: "2024MCA001", name: "Alex Johnson", roll: "01", status: "present" },
    { id: "2024MCA002", name: "Beatrix Kiddo", roll: "02", status: "present" },
    { id: "2024MCA003", name: "Charles Xavier", roll: "03", status: "absent" },
    { id: "2024MCA004", name: "Diana Prince", roll: "04", status: "present" },
    { id: "2024MCA005", name: "Ethan Hunt", roll: "05", status: "late" },
    { id: "2024MCA006", name: "Fiona Gallagher", roll: "06", status: "present" },
    { id: "2024MCA007", name: "George Clark", roll: "07", status: "present" },
    { id: "2024MCA008", name: "Hannah Abbott", roll: "08", status: "absent" },
  ];

  const [students, setStudents] = useState(initialStudents);

  const handleStatusChange = (id, newStatus) => {
    setStudents(
      students.map((st) => (st.id === id ? { ...st, status: newStatus } : st))
    );
    setIsSaved(false);
  };

  const handleMarkAllPresent = () => {
    setStudents(students.map((st) => ({ ...st, status: "present" })));
    setIsSaved(false);
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const lateCount = students.filter((s) => s.status === "late").length;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/teacher/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1E293B]">Class Attendance Marker</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 ml-7">
            Select course and record real-time attendance for today's session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleMarkAllPresent} className="text-xs">
            Mark All Present
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSave} icon={Save} className="text-xs">
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Alert notification */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Attendance sheet saved successfully! Synced with student portal.</span>
        </div>
      )}

      {/* Control Bar & Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] font-bold uppercase">Total Enrolled</span>
            <p className="text-2xl font-extrabold text-[#1E293B]">{students.length}</p>
          </div>
          <Users className="w-6 h-6 text-[#64748B]" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#22C55E] font-bold uppercase">Present</span>
            <p className="text-2xl font-extrabold text-[#22C55E]">{presentCount}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#EF4444] font-bold uppercase">Absent</span>
            <p className="text-2xl font-extrabold text-[#EF4444]">{absentCount}</p>
          </div>
          <XCircle className="w-6 h-6 text-[#EF4444]" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#F97316] font-bold uppercase">Late / Excused</span>
            <p className="text-2xl font-extrabold text-[#F97316]">{lateCount}</p>
          </div>
          <Clock className="w-6 h-6 text-[#F97316]" />
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1E293B]">MCA Semester 3 • Section A</span>
          <span className="text-xs font-mono text-[#64748B]">Date: 07-AUG-2026</span>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {students.map((st) => (
            <div key={st.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#1E293B] text-xs font-bold flex items-center justify-center">
                  {st.roll}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#1E293B]">{st.name}</h4>
                  <p className="text-xs text-[#64748B] font-mono">{st.id}</p>
                </div>
              </div>

              {/* Status Selector Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(st.id, "present")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    st.status === "present"
                      ? "bg-[#22C55E] text-white shadow-sm"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#22C55E]/10 hover:text-[#22C55E]"
                  }`}
                >
                  Present
                </button>
                <button
                  onClick={() => handleStatusChange(st.id, "absent")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    st.status === "absent"
                      ? "bg-[#EF4444] text-white shadow-sm"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                  }`}
                >
                  Absent
                </button>
                <button
                  onClick={() => handleStatusChange(st.id, "late")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    st.status === "late"
                      ? "bg-[#F97316] text-white shadow-sm"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F97316]/10 hover:text-[#F97316]"
                  }`}
                >
                  Late
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarker;
