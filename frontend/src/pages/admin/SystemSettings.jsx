import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Database, Shield, CheckCircle2, Save, Download, AlertTriangle, RefreshCw, FileArchive, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const AdminSystemSettings = () => {
  const [settings, setSettings] = useState({
    system_name: "EduConnect Educational Management System",
    otp_auth: "Active",
    auto_sync: "Enabled",
    pass_mark_threshold: "40",
    max_file_upload_mb: "10",
    academic_term_year: "2026-2027"
  });

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const fetchSettingsAndBackups = async () => {
    setLoading(true);
    try {
      const [settingsRes, backupsRes] = await Promise.all([
        adminApi.getSystemSettings().catch(() => null),
        adminApi.getBackups().catch(() => []),
      ]);

      if (settingsRes && typeof settingsRes === "object") {
        setSettings((prev) => ({
          ...prev,
          ...settingsRes,
        }));
      }

      if (Array.isArray(backupsRes)) {
        setBackups(backupsRes);
      }
    } catch (err) {
      console.error("Failed to load settings or backups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndBackups();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminApi.updateSystemSettings(settings);
      if (updated && typeof updated === "object") {
        setSettings((prev) => ({ ...prev, ...updated }));
      }
      notifySuccess("System settings saved and applied successfully!");
    } catch (err) {
      console.error("Save settings error:", err);
      notifyError(err.message || "Failed to update system settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBackup = async (type = "ALL") => {
    setBackingUp(true);
    try {
      const logs = await adminApi.triggerBackup(type);
      if (Array.isArray(logs) && logs.length > 0) {
        const hasUnavailable = logs.some(l => l.status === "UNAVAILABLE");
        const hasFailed = logs.some(l => l.status === "FAILED");
        
        if (hasUnavailable) {
          const unLog = logs.find(l => l.status === "UNAVAILABLE");
          notifyError(unLog.error_message || "Backup tool pg_dump is unavailable on system PATH.");
        } else if (hasFailed) {
          notifyError("Backup job failed. Inspect backup log table below.");
        } else {
          notifySuccess("Backup job completed successfully!");
        }
      }
      fetchSettingsAndBackups();
    } catch (err) {
      console.error("Backup trigger error:", err);
      notifyError(err.message || "Failed to trigger backup process.");
    } finally {
      setBackingUp(false);
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const response = await fetch(`/api/v1/admin/backup/download/${filename}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Download failed with status " + response.status);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notifySuccess(`Downloaded ${filename} (${formatBytes(blob.size)})`);
    } catch (err) {
      console.error("Download backup error:", err);
      notifyError("Failed to download backup file.");
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-[#F59E0B]" /> System Settings & Maintenance
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">Manage system configuration parameters, security toggles, and real database/uploads backups</p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchSettingsAndBackups} className="text-xs">
          Refresh
        </Button>
      </div>

      {/* System Configuration Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h2 className="text-base font-bold text-[#1E293B]">Institutional System Parameters</h2>
          <Button variant="accent" size="sm" icon={Save} type="submit" disabled={saving} className="text-xs">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">System Branding Name</label>
            <input
              type="text"
              value={settings.system_name || ""}
              onChange={(e) => setSettings({ ...settings, system_name: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              placeholder="System Name"
              required
            />
            <p className="text-[10px] text-[#64748B] mt-1">Controls the system header title across portals</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Active Academic Term</label>
            <input
              type="text"
              value={settings.academic_term_year || ""}
              onChange={(e) => setSettings({ ...settings, academic_term_year: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              placeholder="e.g. 2026-2027"
              required
            />
            <p className="text-[10px] text-[#64748B] mt-1">Global active academic term year identifier</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">OTP Authentication Policy</label>
            <select
              value={settings.otp_auth || "Active"}
              onChange={(e) => setSettings({ ...settings, otp_auth: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
            >
              <option value="Active">Active (Require Email OTP for Login)</option>
              <option value="Disabled">Disabled (Direct Authentication)</option>
            </select>
            <p className="text-[10px] text-[#64748B] mt-1">Controls OTP gateway enforcement on student login</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Database Auto-Sync Pipeline</label>
            <select
              value={settings.auto_sync || "Enabled"}
              onChange={(e) => setSettings({ ...settings, auto_sync: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
            >
              <option value="Enabled">Enabled (Automated Schema Enforcement)</option>
              <option value="Disabled">Disabled (Manual Execution Only)</option>
            </select>
            <p className="text-[10px] text-[#64748B] mt-1">Controls background schema validation & sync checks</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Pass Mark Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.pass_mark_threshold || "40"}
              onChange={(e) => setSettings({ ...settings, pass_mark_threshold: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              required
            />
            <p className="text-[10px] text-[#64748B] mt-1">Minimum passing mark percentage for evaluations</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">Max File Upload Limit (MB)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.max_file_upload_mb || "10"}
              onChange={(e) => setSettings({ ...settings, max_file_upload_mb: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              required
            />
            <p className="text-[10px] text-[#64748B] mt-1">Maximum allowed file size for assignment submissions</p>
          </div>
        </div>
      </form>

      {/* Database Snapshot & Maintenance Section */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-4 gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Database & Uploads Backup Maintenance</h2>
            <p className="text-[#64748B]">Trigger administrator PostgreSQL dumps and durable upload file archives</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={FileArchive}
              onClick={() => handleTriggerBackup("UPLOADS")}
              disabled={backingUp}
              className="text-xs"
            >
              Uploads ZIP
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Database}
              onClick={() => handleTriggerBackup("DB")}
              disabled={backingUp}
              className="text-xs"
            >
              DB Dump
            </Button>

            <Button
              variant="accent"
              size="sm"
              icon={Database}
              onClick={() => handleTriggerBackup("ALL")}
              disabled={backingUp}
              className="text-xs"
            >
              {backingUp ? "Processing..." : "Trigger Full Backup"}
            </Button>
          </div>
        </div>

        {/* Backups History Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-[#1E293B] text-sm flex items-center justify-between">
            <span>Backup Job Records & Artifact Downloads</span>
            <span className="text-xs font-normal text-[#64748B]">({backups.length} recorded)</span>
          </h3>

          {backups.length === 0 ? (
            <div className="text-center py-8 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-[#64748B]">
              <Clock className="w-8 h-8 mx-auto text-[#94A3B8] mb-1" />
              <p className="font-medium text-xs">No backup jobs recorded yet.</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Click "Trigger Full Backup" above to execute a backup operation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Created At</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {backups.map((b) => {
                    const isSuccess = b.status === "SUCCESS";
                    const isUnavailable = b.status === "UNAVAILABLE";
                    return (
                      <tr key={b.backup_id || b.id || b.filename} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-medium text-[#1E293B]">{b.filename}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] font-bold text-[10px]">
                            {b.backup_type || b.backupType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B]">
                          {b.created_at ? String(b.created_at).substring(0, 19).replace("T", " ") : "N/A"}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B]">
                          {formatBytes(b.file_size || b.fileSize)}
                        </td>
                        <td className="py-2.5 px-3">
                          {isSuccess ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Success
                            </span>
                          ) : isUnavailable ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] font-bold text-[10px] inline-flex items-center gap-1" title={b.error_message || b.errorMessage}>
                              <AlertTriangle className="w-3 h-3" /> Tooling Missing
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-bold text-[10px] inline-flex items-center gap-1" title={b.error_message || b.errorMessage}>
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isSuccess ? (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Download}
                              onClick={() => handleDownloadBackup(b.filename)}
                              className="text-[11px] py-1 px-2.5"
                            >
                              Download
                            </Button>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8] italic">
                              {isUnavailable ? "pg_dump missing" : "File unavailable"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
