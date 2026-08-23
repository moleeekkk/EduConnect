import React, { useState, useEffect } from "react";
import { IdCard, PhoneCall, AlertTriangle, ShieldCheck, MapPin, Heart, UserCheck } from "lucide-react";
import { studentApi } from "../../services/api";

const StudentDigitalID = () => {
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;

  const [student, setStudent] = useState({
    student_id: "stu-001",
    enrollment_no: loggedUser?.identifier || "25CI2110016",
    first_name: loggedUser?.name ? loggedUser.name.split(" ")[0] : "Student",
    last_name: loggedUser?.name && loggedUser.name.split(" ").length > 1 ? loggedUser.name.split(" ").slice(1).join(" ") : "User",
    email: loggedUser?.identifier ? loggedUser.identifier.toLowerCase() + "@educonnect.ac.in" : "student@educonnect.ac.in",
    mobile: "+91 98765 43210",
    gender: "Male",
    date_of_birth: "2003-01-01",
    address: "EduConnect Campus Hostel",
    blood_group: "O+",
    parent_name: "Parent / Guardian",
    parent_mobile: "+91 98765 00001",
    profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentApi.getProfile(student.enrollment_no);
        if (data && data.enrollment_no) {
          setStudent((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Profile load error:", err);
      }
    };
    fetchProfile();
  }, [student.enrollment_no]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ID Card Box */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#2563EB] to-[#14B8A6] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden space-y-6">
        {/* Background decoration */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/80 block">EduConnect Institution</span>
            <span className="text-xs font-bold text-white">Department of Computer Applications</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase">
            Student
          </span>
        </div>

        {/* Card Body */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={student.profile_photo}
            alt={student.first_name}
            className="w-24 h-24 rounded-xl object-cover border-2 border-white/40 shadow-md shrink-0"
          />

          <div className="space-y-1.5 text-xs text-center sm:text-left flex-1">
            <h2 className="text-xl font-extrabold tracking-wide">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-white/80 font-mono text-xs">Enrollment No: {student.enrollment_no}</p>
            <p className="text-white/80 text-[11px]">Program: Master of Computer Applications (MCA)</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-semibold">Blood Group: {student.blood_group}</span>
              <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-semibold">Batch: 2025-2027</span>
              <span className="px-2 py-0.5 rounded bg-[#22C55E]/30 text-[#22C55E] text-[10px] font-bold">Active Student</span>
            </div>
          </div>
        </div>

        {/* Emergency Information Box inside Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/15 pb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="uppercase text-[10px] tracking-wider">Emergency Contact Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-white/90">
            <div>
              <span className="text-white/70 block text-[10px]">Guardian / Parent Name:</span>
              <strong className="font-semibold">{student.parent_name}</strong>
            </div>
            <div>
              <span className="text-white/70 block text-[10px]">Emergency Contact Phone:</span>
              <strong className="font-mono text-[#F59E0B] font-bold">{student.parent_mobile}</strong>
            </div>
            <div>
              <span className="text-white/70 block text-[10px]">Student Personal Phone:</span>
              <strong className="font-mono">{student.mobile}</strong>
            </div>
            <div>
              <span className="text-white/70 block text-[10px]">Campus Medical Helpline:</span>
              <strong className="font-mono">+91 79 2630 0000</strong>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="border-t border-white/20 pt-3 flex items-center justify-between text-[10px] text-white/80">
          <span>Student ID: <strong className="font-mono">{student.student_id}</strong></span>
          <span>Valid Through: July 2027</span>
        </div>
      </div>

      {/* Emergency Response & Medical Reference Card */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-[#1E293B] text-sm flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
          <PhoneCall className="w-4 h-4 text-[#EF4444]" /> Emergency Services & Medical Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Primary Residential Address</span>
            <p className="text-[#1E293B] font-medium">{student.address}</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Campus Security & Ambulance</span>
            <p className="text-[#EF4444] font-bold font-mono">+91 98765 00000 / 108</p>
            <p className="text-[10px] text-[#64748B]">EduConnect Emergency Control Room (24x7)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDigitalID;
