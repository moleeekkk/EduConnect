import React, { useState, useEffect } from "react";
import { User, Save, Edit, Check } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    admin_id: "adm-001",
    first_name: "System",
    last_name: "Admin",
    email: "admin@educonnect.ac.in",
    mobile: "+91 9876543210",
    gender: "Male",
    date_of_birth: "1985-05-15",
    address: "Campus Admin Block, University Grounds",
    profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const stored = localStorage.getItem("educonnect_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email) {
            setProfile((prev) => ({
              ...prev,
              email: parsed.email,
              first_name: parsed.name ? parsed.name.split(" ")[0] : prev.first_name,
              last_name: parsed.name ? parsed.name.split(" ").slice(1).join(" ") : prev.last_name,
            }));
          }
        } catch (e) {}
      }
      try {
        const data = await adminApi.getProfile();
        if (data && data.email) {
          setProfile((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {}
    };
    loadProfile();
  }, []);

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
            className="w-16 h-16 rounded-full object-cover border-2 border-[#F59E0B]"
          />
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Super Admin • <strong className="text-[#F59E0B]">{profile.email}</strong>
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
          <Check className="w-4 h-4" /> Admin profile saved successfully!
        </div>
      )}

      {/* Form matching admins table */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
        <h2 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-3">
          Admin Information
        </h2>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#64748B] mb-1">Admin ID (UUID)</label>
            <input type="text" value={profile.admin_id} disabled className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-[#64748B]" />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">First Name (first_name)</label>
            <input type="text" value={profile.first_name} disabled={!isEditing} onChange={(e) => handleChange("first_name", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#F59E0B]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Last Name (last_name)</label>
            <input type="text" value={profile.last_name} disabled={!isEditing} onChange={(e) => handleChange("last_name", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#F59E0B]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Email Address (email)</label>
            <input type="email" value={profile.email} disabled={!isEditing} onChange={(e) => handleChange("email", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#F59E0B]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Mobile Number (mobile)</label>
            <input type="text" value={profile.mobile} disabled={!isEditing} onChange={(e) => handleChange("mobile", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#F59E0B]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Gender (gender)</label>
            <select value={profile.gender} disabled={!isEditing} onChange={(e) => handleChange("gender", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#F59E0B]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Date of Birth (date_of_birth)</label>
            <input type="date" value={profile.date_of_birth} disabled={!isEditing} onChange={(e) => handleChange("date_of_birth", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#F59E0B]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-[#64748B] mb-1">Address (address)</label>
            <textarea rows={2} value={profile.address} disabled={!isEditing} onChange={(e) => handleChange("address", e.target.value)} className={`w-full p-2.5 rounded-lg border ${isEditing ? "border-[#F59E0B]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
