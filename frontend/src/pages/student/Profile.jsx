import React from "react";
import { User, Mail, Phone, Calendar, MapPin, GraduationCap, ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
  const navigate = useNavigate();

  const profile = {
    enrollmentNo: "2024MCA001",
    name: "Alex Johnson",
    email: "alex.johnson@educonnect.ac.in",
    mobile: "+91 98765 43210",
    gender: "Male",
    dob: "15 August 2002",
    address: "Hostel Block A, EduConnect Academic Campus, Sector 42",
    program: "Master of Computer Applications",
    semester: "Semester 3",
    batch: "2024 - 2026",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <button onClick={() => navigate("/student/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Student Profile</h1>
          <p className="text-xs text-[#64748B]">Personal details and institutional registration records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-md">
            AJ
          </div>
          <h2 className="text-lg font-bold text-[#1E293B]">{profile.name}</h2>
          <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-mono font-bold mt-1">
            {profile.enrollmentNo}
          </span>
          <p className="text-xs text-[#64748B] mt-2">{profile.program}</p>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-3">Personal & Academic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">Email Address</span>
              <strong className="text-[#1E293B]">{profile.email}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">Registered Mobile</span>
              <strong className="text-[#1E293B]">{profile.mobile}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">Gender</span>
              <strong className="text-[#1E293B]">{profile.gender}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] uppercase font-bold block">Date of Birth</span>
              <strong className="text-[#1E293B]">{profile.dob}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <span className="text-[#64748B] text-[10px] uppercase font-bold block">Residential Address</span>
            <strong className="text-[#1E293B]">{profile.address}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
