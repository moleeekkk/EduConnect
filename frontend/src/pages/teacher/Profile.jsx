import React, { useState } from "react";
import { User, Save, Edit, Check } from "lucide-react";
import Button from "../../components/common/Button";
import { mockTeachers } from "../../data/mockData";

const TeacherProfile = () => {
  const [profile, setProfile] = useState(mockTeachers[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={profile.profile_photo}
            alt={`${profile.first_name} ${profile.last_name}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#14B8A6]"
          />
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Employee ID: <strong className="text-[#14B8A6]">{profile.employee_id}</strong> • {profile.designation}
            </p>
          </div>
        </div>

        <div>
          {isEditing ? (
            <Button variant="accent" size="sm" onClick={handleSave} icon={Save} className="text-xs">
              Save Profile
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
          <Check className="w-4 h-4" /> Faculty profile details saved successfully!
        </div>
      )}

      {/* Form matching teachers table fields */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
        <h2 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-3">
          Teacher Profile Information
        </h2>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#64748B] mb-1">Teacher ID (UUID)</label>
            <input type="text" value={profile.teacher_id} disabled className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-[#64748B]" />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Employee ID (employee_id)</label>
            <input type="text" value={profile.employee_id} disabled className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#1E293B]" />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">First Name (first_name)</label>
            <input type="text" value={profile.first_name} disabled={!isEditing} onChange={(e) => handleChange("first_name", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Last Name (last_name)</label>
            <input type="text" value={profile.last_name} disabled={!isEditing} onChange={(e) => handleChange("last_name", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Email Address (email)</label>
            <input type="email" value={profile.email} disabled={!isEditing} onChange={(e) => handleChange("email", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Mobile Number (mobile)</label>
            <input type="text" value={profile.mobile} disabled={!isEditing} onChange={(e) => handleChange("mobile", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Designation (designation)</label>
            <input type="text" value={profile.designation} disabled={!isEditing} onChange={(e) => handleChange("designation", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Qualification (qualification)</label>
            <input type="text" value={profile.qualification} disabled={!isEditing} onChange={(e) => handleChange("qualification", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Teaching Experience (experience in years)</label>
            <input type="number" value={profile.experience} disabled={!isEditing} onChange={(e) => handleChange("experience", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Joining Date (joining_date)</label>
            <input type="date" value={profile.joining_date} disabled className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-[#64748B] mb-1">Address (address)</label>
            <textarea rows={2} value={profile.address} disabled={!isEditing} onChange={(e) => handleChange("address", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#14B8A6]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfile;
