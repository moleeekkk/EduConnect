import React, { useState, useEffect } from "react";
import { IdCard, PhoneCall, AlertTriangle, ShieldCheck, MapPin, Heart, UserCheck, RefreshCw, AlertCircle } from "lucide-react";
import { studentApi } from "../../services/api";

const StudentDigitalID = () => {
  const [digitalIdData, setDigitalIdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDigitalID = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getDigitalID();
      if (data && Object.keys(data).length > 0) {
        setDigitalIdData(data);
      } else {
        setError("Student Digital ID record not found.");
      }
    } catch (err) {
      console.error("Digital ID load error:", err);
      setError("Failed to load Digital ID. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigitalID();
  }, []);

  const displayValue = (val, fallback = "Not available") => {
    if (val === null || val === undefined || String(val).trim() === "") {
      return fallback;
    }
    return val;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#64748B]">Loading Digital ID record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 rounded-xl border border-red-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-red-800">{error}</h3>
        <button
          onClick={fetchDigitalID}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
        </button>
      </div>
    );
  }

  const studentName = digitalIdData?.name || 
    (`${digitalIdData?.first_name || ''} ${digitalIdData?.last_name || ''}`).trim() || 
    "Not available";

  const isStudentActive = Boolean(digitalIdData?.is_active);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ID Card Container */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#2563EB] to-[#14B8A6] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden space-y-6">
        {/* Background decoration */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/80 block">
              {displayValue(digitalIdData?.institute_name, "EduConnect Institution")}
            </span>
            <span className="text-xs font-bold text-white">
              {displayValue(digitalIdData?.department_name || digitalIdData?.program_label, "Department Not Assigned")}
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
            isStudentActive ? "bg-white/20 text-white" : "bg-red-500/40 text-red-200"
          }`}>
            {isStudentActive ? "Active Student" : "Inactive Student"}
          </span>
        </div>

        {/* Card Body */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {digitalIdData?.profile_photo ? (
            <img
              src={digitalIdData.profile_photo}
              alt={studentName}
              className="w-24 h-24 rounded-xl object-cover border-2 border-white/40 shadow-md shrink-0 bg-white/10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-24 h-24 rounded-xl border-2 border-white/40 shadow-md shrink-0 bg-white/10 items-center justify-center text-white/70 font-bold text-2xl ${
              digitalIdData?.profile_photo ? "hidden" : "flex"
            }`}
          >
            {studentName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1.5 text-xs text-center sm:text-left flex-1">
            <h2 className="text-xl font-extrabold tracking-wide">
              {studentName}
            </h2>
            <p className="text-white/80 font-mono text-xs">
              Enrollment No: <strong className="text-white">{displayValue(digitalIdData?.enrollment_no)}</strong>
            </p>
            <p className="text-white/80 text-[11px]">
              Program: {displayValue(digitalIdData?.department_name || digitalIdData?.program_label)}
            </p>
            {digitalIdData?.semester_name && (
              <p className="text-white/80 text-[11px]">
                Semester: {digitalIdData.semester_name}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-semibold">
                Blood Group: {displayValue(digitalIdData?.blood_group)}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-semibold">
                Batch: {displayValue(digitalIdData?.batch_name)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isStudentActive ? "bg-[#22C55E]/30 text-[#22C55E]" : "bg-red-500/30 text-red-300"
              }`}>
                {isStudentActive ? "Active Student" : "Inactive Student"}
              </span>
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
              <strong className="font-semibold">{displayValue(digitalIdData?.parent_name)}</strong>
            </div>
            <div>
              <span className="text-white/70 block text-[10px]">Emergency Contact Phone:</span>
              <strong className="font-mono text-[#F59E0B] font-bold">{displayValue(digitalIdData?.parent_mobile)}</strong>
            </div>
            <div>
              <span className="text-white/70 block text-[10px]">Student Personal Phone:</span>
              <strong className="font-mono">{displayValue(digitalIdData?.mobile)}</strong>
            </div>
            <div>
              <span className="text-white/70 block text-[10px]">Student Email:</span>
              <strong className="font-mono text-white/90">{displayValue(digitalIdData?.email)}</strong>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="border-t border-white/20 pt-3 flex items-center justify-between text-[10px] text-white/80">
          <span>Student ID: <strong className="font-mono">{displayValue(digitalIdData?.student_id)}</strong></span>
          <span>Valid Through: <strong className="font-semibold text-white">{displayValue(digitalIdData?.valid_until || digitalIdData?.validity_date)}</strong></span>
        </div>
      </div>

      {/* Primary Residential Address & Student Record Info */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-[#1E293B] text-sm flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
          <MapPin className="w-4 h-4 text-[#2563EB]" /> Official Residential & Record Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Primary Residential Address</span>
            <p className="text-[#1E293B] font-medium">{displayValue(digitalIdData?.address)}</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Institution & Academic Scope</span>
            <p className="text-[#1E293B] font-medium">{displayValue(digitalIdData?.institute_name)}</p>
            <p className="text-[10px] text-[#64748B]">{displayValue(digitalIdData?.department_name || digitalIdData?.program_label)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDigitalID;
