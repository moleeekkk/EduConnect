import React, { useState, useEffect } from "react";
import { Save, Edit, Check } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentProfile = () => {
  const userStr = localStorage.getItem("educonnect_user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;
  const enrollmentNo = loggedUser?.identifier || "";

  const [profile, setProfile] = useState({
    student_id: loggedUser?.userId || "",
    enrollment_no: enrollmentNo,
    first_name: loggedUser?.name ? loggedUser.name.split(" ")[0] : "",
    last_name: loggedUser?.name && loggedUser.name.split(" ").length > 1 ? loggedUser.name.split(" ").slice(1).join(" ") : "",
    email: loggedUser?.identifier && loggedUser.identifier.includes("@") ? loggedUser.identifier : "",
    mobile: "",
    gender: "",
    date_of_birth: "",
    address: "",
    blood_group: "",
    parent_name: "",
    parent_mobile: "",
    admission_date: "",
    profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (enrollmentNo) {
      studentApi.getProfile(enrollmentNo)
        .then((res) => {
          if (res && res.enrollmentNo) {
            setProfile((prev) => ({
              ...prev,
              enrollment_no: res.enrollmentNo || prev.enrollment_no,
              first_name: res.name ? res.name.split(" ")[0] : prev.first_name,
              last_name: res.name && res.name.split(" ").length > 1 ? res.name.split(" ").slice(1).join(" ") : prev.last_name,
              email: res.email || prev.email,
              mobile: res.mobile || prev.mobile,
              gender: res.gender || prev.gender,
              date_of_birth: res.dob || prev.date_of_birth,
              address: res.address || prev.address,
            }));
          }
        })
        .catch(() => {});
    }
  }, [enrollmentNo]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={profile.profile_photo}
            alt={`${profile.first_name} ${profile.last_name}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#2563EB]"
          />
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">
              {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Student Profile"}
            </h1>
            <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
              <span>Enrollment: <strong className="text-[#2563EB]">{profile.enrollment_no || "N/A"}</strong></span>
              <span>•</span>
              <span>Status: <strong className="text-[#22C55E]">Active Student</strong></span>
            </p>
          </div>
        </div>

        <div>
          {isEditing ? (
            <Button variant="accent" size="sm" onClick={handleSave} icon={Save} className="text-xs">
              Save Changes
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon={Edit} className="text-xs">
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> Profile details updated successfully!
        </div>
      )}

      {/* Form Details */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
        <h2 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-3">
          Student Information
        </h2>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#64748B] mb-1">Student ID</label>
            <input
              type="text"
              value={profile.student_id}
              disabled
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-[#64748B]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Enrollment No</label>
            <input
              type="text"
              value={profile.enrollment_no}
              disabled
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">First Name</label>
            <input
              type="text"
              value={profile.first_name}
              disabled={!isEditing}
              onChange={(e) => handleChange("first_name", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Last Name</label>
            <input
              type="text"
              value={profile.last_name}
              disabled={!isEditing}
              onChange={(e) => handleChange("last_name", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email}
              disabled={!isEditing}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Mobile Number</label>
            <input
              type="text"
              value={profile.mobile}
              disabled={!isEditing}
              onChange={(e) => handleChange("mobile", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Gender</label>
            <select
              value={profile.gender}
              disabled={!isEditing}
              onChange={(e) => handleChange("gender", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Date of Birth</label>
            <input
              type="date"
              value={profile.date_of_birth}
              disabled={!isEditing}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Blood Group</label>
            <input
              type="text"
              value={profile.blood_group}
              disabled={!isEditing}
              onChange={(e) => handleChange("blood_group", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Admission Date</label>
            <input
              type="date"
              value={profile.admission_date}
              disabled
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Parent Name</label>
            <input
              type="text"
              value={profile.parent_name}
              disabled={!isEditing}
              onChange={(e) => handleChange("parent_name", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Parent Mobile</label>
            <input
              type="text"
              value={profile.parent_mobile}
              disabled={!isEditing}
              onChange={(e) => handleChange("parent_mobile", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-[#64748B] mb-1">Address</label>
            <textarea
              rows={2}
              value={profile.address}
              disabled={!isEditing}
              onChange={(e) => handleChange("address", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#2563EB]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
