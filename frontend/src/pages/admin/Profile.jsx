import React, { useState, useEffect } from "react";
import { User, Save, Edit, Check, Camera, KeyRound, Lock, Loader2, ShieldCheck } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    admin_id: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "",
    address: "",
    profile_photo: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password Modal/Section State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passSaving, setPassSaving] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getProfile();
      if (data) {
        setProfile({
          admin_id: data.admin_id || data.adminId || "",
          first_name: data.first_name || data.firstName || "",
          last_name: data.last_name || data.lastName || "",
          email: data.email || "",
          mobile: data.mobile || "",
          gender: data.gender || "Male",
          date_of_birth: data.date_of_birth || data.dateOfBirth || data.dob || "",
          address: data.address || "",
          profile_photo: data.profile_photo || data.profilePhoto || "",
        });
      }
    } catch (err) {
      console.error("Failed to load admin profile from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Image Upload File Handler with automatic canvas optimization
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        notifyError("Image file size must be less than 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 300;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
          setProfile((prev) => ({ ...prev, profile_photo: compressedDataUrl }));
          setIsEditing(true);
          notifySuccess("Profile photo selected! Click 'Save Profile' in the top right header to persist changes.");
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        admin_id: profile.admin_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        mobile: profile.mobile,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        address: profile.address,
        profile_photo: profile.profile_photo,
      };

      const updated = await adminApi.updateProfile(payload);
      if (updated) {
        setProfile({
          admin_id: updated.admin_id || updated.adminId || profile.admin_id,
          first_name: updated.first_name || updated.firstName || profile.first_name,
          last_name: updated.last_name || updated.lastName || profile.last_name,
          email: updated.email || profile.email,
          mobile: updated.mobile || profile.mobile,
          gender: updated.gender || profile.gender,
          date_of_birth: updated.date_of_birth || updated.dateOfBirth || profile.date_of_birth,
          address: updated.address || profile.address,
          profile_photo: updated.profile_photo || updated.profilePhoto || profile.profile_photo,
        });

        // Sync with local storage user & inform Navbar
        const userStr = localStorage.getItem("educonnect_user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            userObj.name = `${updated.first_name || profile.first_name} ${updated.last_name || profile.last_name}`;
            userObj.profile_photo = updated.profile_photo || profile.profile_photo;
            localStorage.setItem("educonnect_user", JSON.stringify(userObj));
          } catch (e) {}
        }
        window.dispatchEvent(new Event("profile_updated"));
      }
      setIsEditing(false);
      notifySuccess("Admin profile details saved to database successfully!");
    } catch (err) {
      console.error("Save admin profile error:", err);
      notifyError("Failed to update admin profile in database.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passData.newPassword || passData.newPassword.trim() === "") {
      notifyError("New Password cannot be empty.");
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      notifyError("New Password and Confirm Password do not match.");
      return;
    }
    if (passData.newPassword.length < 6) {
      notifyError("Password must be at least 6 characters long.");
      return;
    }

    setPassSaving(true);
    try {
      const res = await adminApi.changePassword({
        email: profile.email,
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });

      if (res && res.success !== false) {
        notifySuccess("Admin password updated successfully in database!");
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordModal(false);
      } else {
        notifyError(res?.message || "Failed to update password. Check your current password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      const serverMsg = err.response?.data?.message || err.message || "Failed to update password.";
      notifyError(serverMsg);
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#64748B] space-x-2 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
        <span>Loading Admin Profile from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-4">
          {/* Profile Photo with Upload Trigger */}
          <div className="relative group shrink-0">
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#2563EB] shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
                {(profile.first_name || "A")[0]}
              </div>
            )}
            <label
              htmlFor="profile_photo_file"
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              title="Change Profile Picture"
            >
              <Camera className="w-5 h-5" />
            </label>
            <input
              type="file"
              id="profile_photo_file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div>
            <h1 className="text-lg font-extrabold text-[#1E293B]">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Administrator • <strong className="text-[#2563EB]">{profile.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={KeyRound}
            onClick={() => setShowPasswordModal(true)}
            className="text-xs"
          >
            Change Password
          </Button>

          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleSaveProfile}
                isLoading={saving}
                icon={Save}
                className="text-xs"
              >
                Save Profile
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={Edit}
              className="text-xs"
            >
              Edit Details
            </Button>
          )}
        </div>
      </div>

      {/* Main Profile Form Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
            <User className="w-4 h-4 text-[#2563EB]" /> Official Administrator Profile
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold">
            Database Verified
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Profile Picture File Upload / URL field */}
          <div className="sm:col-span-2 space-y-1.5 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <label className="block font-bold text-[#1E293B]">Profile Picture</label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Paste Image URL or choose file on right"
                value={profile.profile_photo}
                onChange={(e) => handleChange("profile_photo", e.target.value)}
                disabled={!isEditing}
                className={`flex-1 w-full p-2.5 rounded-lg border font-mono text-xs ${
                  isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-gray-50 text-[#64748B]"
                }`}
              />
              <label
                htmlFor="profile_photo_input"
                className="px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 bg-[#2563EB] text-white border-[#2563EB] hover:bg-[#1D4ED8]"
              >
                <Camera className="w-4 h-4" /> Upload New Photo
              </label>
              <input
                type="file"
                id="profile_photo_input"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#64748B] mb-1">Admin ID (Database UUID)</label>
            <input
              type="text"
              value={profile.admin_id}
              disabled
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-[#64748B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#64748B] mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email}
              disabled={!isEditing}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${
                isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#64748B] mb-1">First Name</label>
            <input
              type="text"
              value={profile.first_name}
              disabled={!isEditing}
              onChange={(e) => handleChange("first_name", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${
                isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#64748B] mb-1">Last Name</label>
            <input
              type="text"
              value={profile.last_name}
              disabled={!isEditing}
              onChange={(e) => handleChange("last_name", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${
                isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#64748B] mb-1">Mobile Number</label>
            <input
              type="text"
              value={profile.mobile}
              disabled={!isEditing}
              onChange={(e) => handleChange("mobile", e.target.value)}
              className={`w-full p-2.5 rounded-lg border font-mono ${
                isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#64748B] mb-1">Gender</label>
            <select
              value={profile.gender}
              disabled={!isEditing}
              onChange={(e) => handleChange("gender", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${
                isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#64748B] mb-1">Date of Birth</label>
            <input
              type="date"
              value={profile.date_of_birth}
              disabled={!isEditing}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${
                isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#64748B] mb-1">Residential Address</label>
            <textarea
              rows={2}
              value={profile.address}
              disabled={!isEditing}
              onChange={(e) => handleChange("address", e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${
                isEditing ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            />
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Change Admin Password</h3>
                  <p className="text-[11px] text-[#64748B]">Update your login credentials in database</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" isLoading={passSaving}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
