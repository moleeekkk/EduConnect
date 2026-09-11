import React, { useState, useEffect, useRef } from "react";
import { User, Save, Edit, Check, Lock, KeyRound, Loader2, Camera, Upload } from "lucide-react";
import Button from "../../components/common/Button";
import { fileApi, teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherProfile = () => {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    teacher_id: "",
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "Female",
    date_of_birth: "",
    address: "",
    qualification: "",
    designation: "",
    experience: 0,
    joining_date: "",
    profile_photo: "",
    is_active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle local image file selection / upload
  const handleImageFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notifyError("Image file size must be less than 5MB.");
        return;
      }
      try {
        const metadata = await fileApi.uploadFile(file, "profile");
        if (metadata && metadata.filePath) {
          setProfile((prev) => ({ ...prev, profile_photo: metadata.filePath }));
          notifySuccess("Photo uploaded! Click 'Save Profile' to persist your new photo.");
          return;
        }
      } catch (err) {
        console.warn("Direct upload failed, falling back to local preview:", err);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result;
        setProfile((prev) => ({ ...prev, profile_photo: base64Str }));
        notifySuccess("Photo updated! Click 'Save Profile' to persist your new photo.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Password change state
  const [passForm, setPassForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [changingPass, setChangingPass] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.current_password || !passForm.new_password) {
      notifyError("Please enter current password and new password.");
      return;
    }
    if (passForm.new_password.length < 4) {
      notifyError("New password must be at least 4 characters long.");
      return;
    }
    if (passForm.new_password !== passForm.confirm_password) {
      notifyError("New passwords do not match. Please re-enter.");
      return;
    }

    setChangingPass(true);
    try {
      await teacherApi.changePassword({
        current_password: passForm.current_password,
        new_password: passForm.new_password,
      });
      notifySuccess("Password updated successfully! Use your new password on next login.");
      setPassForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error("Change password error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to update password.";
      notifyError(`Password change error: ${msg}`);
    } finally {
      setChangingPass(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await teacherApi.getProfile();
        if (data && (data.teacher_id || data.email)) {
          setProfile((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (err) {
        console.error("Teacher profile load error:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const updated = await teacherApi.updateProfile(profile);
      if (updated && (updated.email || updated.teacher_id)) {
        setProfile((prev) => ({ ...prev, ...updated }));
        const fullName = `${updated.first_name || ""} ${updated.last_name || ""}`.trim();
        const userObj = {
          role: "ROLE_TEACHER",
          name: fullName || "Faculty Member",
          email: updated.email,
          identifier: updated.email,
          userId: updated.teacher_id,
        };
        sessionStorage.setItem("educonnect_user_teacher", JSON.stringify(userObj));
        sessionStorage.setItem("educonnect_user", JSON.stringify(userObj));
        localStorage.setItem("educonnect_user_teacher", JSON.stringify(userObj));
        localStorage.setItem("educonnect_user", JSON.stringify(userObj));
      }
      setIsEditing(false);
      setSavedSuccess(true);
      notifySuccess("Teacher profile details updated successfully!");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Teacher profile save error:", err);
      notifyError(err.message || "Failed to save profile changes.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-4">
          {/* Profile Photo with Click-to-Upload */}
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile photo"
          >
            <img
              src={profile.profile_photo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#14B8A6] shadow-xs group-hover:opacity-80 transition-all"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

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
          {isEditing && (
            <div className="sm:col-span-2 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
              <label className="block font-bold text-[#1E293B]">Profile Photo (Upload File or Paste Image URL)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={profile.profile_photo || ""}
                  onChange={(e) => handleChange("profile_photo", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-2.5 rounded-lg border border-[#14B8A6] bg-white outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-[#14B8A6]/10 text-[#14B8A6] rounded-lg font-bold hover:bg-[#14B8A6]/20 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Upload Image File
                </button>
              </div>
            </div>
          )}

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

      {/* Security & Password Change Section */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <KeyRound className="w-5 h-5 text-[#14B8A6]" />
          <div>
            <h3 className="text-base font-bold text-[#1E293B]">Security & Account Password</h3>
            <p className="text-xs text-[#64748B]">Initial password is <code className="bg-slate-100 text-[#14B8A6] px-1.5 py-0.5 rounded font-mono font-bold">teacher123</code>. You can change your password below.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#64748B] mb-1">Current Password</label>
            <input
              type="password"
              placeholder="e.g. teacher123"
              value={passForm.current_password}
              onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white outline-none focus:border-[#14B8A6]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={passForm.new_password}
              onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white outline-none focus:border-[#14B8A6]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-[#64748B] mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={passForm.confirm_password}
              onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white outline-none focus:border-[#14B8A6]"
              required
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={changingPass}
              icon={Lock}
              className="text-xs"
            >
              Update Teacher Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfile;
