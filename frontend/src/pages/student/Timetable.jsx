import React, { useState, useEffect } from "react";
import { Clock, User, Calendar, BookOpen } from "lucide-react";
import { studentApi } from "../../services/api";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await studentApi.getTimetable();
        if (Array.isArray(data)) {
          setTimetable(data);
        } else {
          setTimetable([]);
        }
      } catch (err) {
        console.error("Timetable load error:", err);
        setTimetable([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Academic Timetable</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Weekly class schedule for your enrolled batch & semester</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
          Loading timetable schedules...
        </div>
      ) : timetable.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0] space-y-3">
          <Calendar className="w-10 h-10 text-[#64748B] mx-auto stroke-1" />
          <h3 className="text-base font-bold text-[#1E293B]">No Timetable Scheduled</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            There are currently no active timetable classes published for your department and batch cohort.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timetable.map((dayItem) => (
            <div key={dayItem.day} className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="bg-[#F8FAFC] p-3 border-b border-[#E2E8F0] font-bold text-xs text-[#2563EB] uppercase flex items-center justify-between">
                <span>{dayItem.day}</span>
                <span className="text-[10px] text-[#64748B] font-mono">
                  {dayItem.slots?.length || 0} {dayItem.slots?.length === 1 ? "Class" : "Classes"}
                </span>
              </div>
              <div className="p-3 space-y-3">
                {dayItem.slots && dayItem.slots.map((slot, idx) => (
                  <div key={slot.timetable_id || idx} className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#64748B] font-mono text-[11px]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> {slot.time}
                      </span>
                      <span className="font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full">
                        {slot.room}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#1E293B]">
                      {slot.subject} {slot.code ? `(${slot.code})` : ""}
                    </h4>
                    <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                      <User className="w-3 h-3 text-[#64748B]" /> {slot.teacher}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
