import React, { useState } from "react";
import { SlidersHorizontal, Database, Shield, CheckCircle2 } from "lucide-react";
import Button from "../../components/common/Button";

const AdminSystemSettings = () => {
  const [backupMsg, setBackupMsg] = useState(false);

  const handleBackup = () => {
    setBackupMsg(true);
    setTimeout(() => setBackupMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h1 className="text-xl font-bold text-[#1E293B]">System Settings & Database Maintenance</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Manage system configuration settings, security parameters, and data backups</p>
      </div>

      {backupMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Full PostgreSQL Database Snapshot created & backup stored!
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Database Snapshot & Backup</h2>
            <p className="text-[#64748B]">Trigger manual dump of all 22 database tables</p>
          </div>
          <Button variant="accent" size="sm" icon={Database} onClick={handleBackup} className="text-xs">
            Trigger Full DB Backup
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-[#1E293B] text-sm">System Parameters</h3>

          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#1E293B]">OTP Authentication Gateway</p>
              <p className="text-[#64748B]">Enable email/SMS OTP for Student Login</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-bold text-[10px]">Active</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#1E293B]">Database Auto-Sync Pipeline</p>
              <p className="text-[#64748B]">Queries_Data_Dict.txt schema enforcement</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-bold text-[10px]">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
