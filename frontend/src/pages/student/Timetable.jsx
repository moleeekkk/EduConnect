import React, { useState, useEffect } from "react";
import { Clock, MapPin, User, BookOpen } from "lucide-react";
import { studentApi } from "../../services/api";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await studentApi.getTimetable();
        if (Array.isArray(data)) {
          setTimetable(data);
        }
      } catch (err) {
        console.error("Timetable load error:", err);
      }
    };
    fetchTimetable();
  }, []);

  const defaultSchedule = [
    { day: "Monday", slots: [{ time: "09:30 AM - 11:00 AM", subject: "Advanced Web Technologies", code: "MCA301", teacher: "Faculty Member", room: "Lab 302" }] },
    { day: "Tuesday", slots: [{ time: "09:30 AM - 11:00 AM", subject: "Database Architecture", code: "MCA303", teacher: "Faculty Member", room: "Lab 105" }] },
    { day: "Wednesday", slots: [{ time: "10:00 AM - 11:30 AM", subject: "Software Testing", code: "MCA304", teacher: "Faculty Member", room: "Hall A" }] },
    { day: "Thursday", slots: [{ time: "09:30 AM - 11:00 AM", subject: "Advanced Web Technologies", code: "MCA301", teacher: "Faculty Member", room: "Lab 302" }] },
    { day: "Friday", slots: [{ time: "09:30 AM - 11:00 AM", subject: "Cloud Infrastructure & DevOps", code: "MCA302", teacher: "Faculty Member", room: "Hall B" }] },
  ];

  const schedule = timetable.length > 0 ? timetable : defaultSchedule;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h1 className="text-xl font-bold text-[#1E293B]">Timetable</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((dayItem) => (
          <div key={dayItem.day} className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="bg-[#F8FAFC] p-3 border-b border-[#E2E8F0] font-bold text-xs text-[#2563EB] uppercase">
              {dayItem.day}
            </div>
            <div className="p-3 space-y-3">
              {dayItem.slots.map((slot, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[#64748B] font-mono text-[11px]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#2563EB]" /> {slot.time}</span>
                    <span className="font-bold text-[#14B8A6]">{slot.room}</span>
                  </div>
                  <h4 className="font-bold text-[#1E293B]">{slot.subject} ({slot.code})</h4>
                  <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <User className="w-3 h-3" /> {slot.teacher}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentTimetable;
