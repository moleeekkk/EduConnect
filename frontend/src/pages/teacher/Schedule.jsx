import React, { useState, useEffect } from "react";
import { Clock, User, Calendar, MapPin, BookOpen, Layers } from "lucide-react";
import { teacherApi } from "../../services/api";

const TeacherSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await teacherApi.getSchedule();
        if (Array.isArray(data)) {
          setSchedule(data);
        } else {
          setSchedule([]);
        }
      } catch (err) {
        console.error("Teacher schedule load error:", err);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Teaching Schedule</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Your official assigned weekly class schedule</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
          Loading your teaching schedule...
        </div>
      ) : schedule.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0] space-y-3">
          <Calendar className="w-10 h-10 text-[#64748B] mx-auto stroke-1" />
          <h3 className="text-base font-bold text-[#1E293B]">No Teaching Sessions Assigned</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            You do not currently have any active timetable classes assigned in the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((dayItem) => (
            <div key={dayItem.day} className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="bg-[#F8FAFC] p-3 border-b border-[#E2E8F0] font-bold text-xs text-[#2563EB] uppercase flex items-center justify-between">
                <span>{dayItem.day}</span>
                <span className="text-[10px] text-[#64748B] font-mono">
                  {dayItem.slots?.length || 0} {dayItem.slots?.length === 1 ? "Session" : "Sessions"}
                </span>
              </div>
              <div className="p-3 space-y-3">
                {dayItem.slots && dayItem.slots.map((slot, idx) => (
                  <div key={slot.timetable_id || idx} className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#64748B] font-mono text-[11px]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> {slot.time}
                      </span>
                      <span className="font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full">
                        {slot.room}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E293B]">
                        {slot.subject} {slot.code ? `(${slot.code})` : ""}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#2563EB]" /> {slot.batch || "Cohort"}
                        </span>
                        {slot.semester && (
                          <span>• {slot.semester}</span>
                        )}
                      </div>
                    </div>
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

export default TeacherSchedule;
