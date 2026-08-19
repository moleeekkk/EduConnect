import React from "react";
import { Clock, User } from "lucide-react";
import { mockSubjects, mockTeachers } from "../../data/mockData";

const StudentTimetable = () => {
  const hasScheduleData = mockSubjects && mockSubjects.length > 0;
  const schedule = hasScheduleData
    ? [
        {
          day: "Monday",
          slots: [
            {
              time: "09:30 AM - 11:00 AM",
              subject: mockSubjects[0]?.subject_name || "",
              code: mockSubjects[0]?.subject_code || "",
              teacher: mockTeachers[0] ? mockTeachers[0].first_name + " " + mockTeachers[0].last_name : "",
              room: "Lab 302",
            },
          ],
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h1 className="text-xl font-bold text-[#1E293B]">Timetable</h1>
      </div>

      {schedule.length > 0 ? (
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
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#2563EB]" /> {slot.time}
                      </span>
                      <span className="font-bold text-[#14B8A6]">{slot.room}</span>
                    </div>
                    <h4 className="font-bold text-[#1E293B]">
                      {slot.subject} ({slot.code})
                    </h4>
                    {slot.teacher && (
                      <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <User className="w-3 h-3" /> {slot.teacher}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          No class timetable scheduled available.
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
