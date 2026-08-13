import React from "react";
import { Clock, MapPin, User, BookOpen } from "lucide-react";
import { mockSubjects, mockTeachers } from "../../data/mockData";

const StudentTimetable = () => {
  const schedule = [
    { day: "Monday", slots: [
      { time: "09:30 AM - 11:00 AM", subject: mockSubjects[0]?.subject_name || "Advanced Web Technologies", code: mockSubjects[0]?.subject_code || "MCA301", teacher: mockTeachers[0] ? mockTeachers[0].first_name + " " + mockTeachers[0].last_name : "Faculty Member", room: "Lab 302" },
      { time: "11:30 AM - 01:00 PM", subject: mockSubjects[1]?.subject_name || "Cloud Infrastructure & DevOps", code: mockSubjects[1]?.subject_code || "MCA302", teacher: mockTeachers[1] ? mockTeachers[1].first_name + " " + mockTeachers[1].last_name : "Prof. Michael Vance", room: "Hall B" },
    ]},
    { day: "Tuesday", slots: [
      { time: "09:30 AM - 11:00 AM", subject: mockSubjects[2]?.subject_name || "Database Architecture", code: mockSubjects[2]?.subject_code || "MCA303", teacher: "Er. Rahul Mehta", room: "Lab 105" },
      { time: "02:00 PM - 04:00 PM", subject: mockSubjects[0]?.subject_name || "Advanced Web Technologies", code: mockSubjects[0]?.subject_code || "MCA301", teacher: mockTeachers[0] ? mockTeachers[0].first_name + " " + mockTeachers[0].last_name : "Faculty Member", room: "Lab 302" },
    ]},
    { day: "Wednesday", slots: [
      { time: "10:00 AM - 11:30 AM", subject: mockSubjects[3]?.subject_name || "Software Testing", code: mockSubjects[3]?.subject_code || "MCA304", teacher: "Dr. Ananya Sharma", room: "Hall A" },
      { time: "11:30 AM - 01:00 PM", subject: mockSubjects[1]?.subject_name || "Cloud Infrastructure & DevOps", code: mockSubjects[1]?.subject_code || "MCA302", teacher: mockTeachers[1] ? mockTeachers[1].first_name + " " + mockTeachers[1].last_name : "Prof. Michael Vance", room: "Hall B" },
    ]},
    { day: "Thursday", slots: [
      { time: "09:30 AM - 11:00 AM", subject: mockSubjects[0]?.subject_name || "Advanced Web Technologies", code: mockSubjects[0]?.subject_code || "MCA301", teacher: mockTeachers[0] ? mockTeachers[0].first_name + " " + mockTeachers[0].last_name : "Faculty Member", room: "Lab 302" },
      { time: "02:00 PM - 04:00 PM", subject: mockSubjects[2]?.subject_name || "Database Architecture", code: mockSubjects[2]?.subject_code || "MCA303", teacher: "Er. Rahul Mehta", room: "Lab 105" },
    ]},
    { day: "Friday", slots: [
      { time: "09:30 AM - 11:00 AM", subject: mockSubjects[1]?.subject_name || "Cloud Infrastructure & DevOps", code: mockSubjects[1]?.subject_code || "MCA302", teacher: mockTeachers[1] ? mockTeachers[1].first_name + " " + mockTeachers[1].last_name : "Prof. Michael Vance", room: "Hall B" },
      { time: "11:30 AM - 01:00 PM", subject: mockSubjects[3]?.subject_name || "Software Testing", code: mockSubjects[3]?.subject_code || "MCA304", teacher: "Dr. Ananya Sharma", room: "Hall A" },
    ]},
  ];

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
