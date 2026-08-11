import React, { useState } from "react";
import { BadgeAlert, Plus, CheckCircle2, Clock, XCircle, Send, Calendar, X } from "lucide-react";
import Button from "../../components/common/Button";
import { mockLeaveRequests } from "../../data/mockData";

const StudentLeaveRequest = () => {
  const [requests, setRequests] = useState(mockLeaveRequests);
  const [showModal, setShowModal] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [newForm, setNewForm] = useState({
    leave_type: "Sick",
    from_date: todayStr,
    to_date: todayStr,
    reason: "",
  });
  const [successMsg, setSuccessMsg] = useState(false);

  // Helper to calculate total leave days
  const getLeaveDaysCount = (fromDateStr, toDateStr) => {
    if (!fromDateStr || !toDateStr) return 0;
    const start = new Date(fromDateStr);
    const end = new Date(toDateStr);
    if (end < start) return 0;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const currentLeaveDays = getLeaveDaysCount(newForm.from_date, newForm.to_date);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentLeaveDays <= 0) {
      alert("To Date cannot be earlier than From Date.");
      return;
    }

    const created = {
      leave_request_id: `leave-00${requests.length + 1}`,
      student_id: "stu-001",
      leave_type: newForm.leave_type,
      from_date: newForm.from_date,
      to_date: newForm.to_date,
      reason: newForm.reason,
      status: "Pending",
      reviewed_by: null,
      reviewed_date: null,
      remarks: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRequests([created, ...requests]);
    setShowModal(false);
    setNewForm({ leave_type: "Sick", from_date: todayStr, to_date: todayStr, reason: "" });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Leave Management</h1>
        </div>

        {/* Compact reduced-width Apply Leave button */}
        <Button
          variant="accent"
          size="sm"
          icon={Plus}
          onClick={() => {
            setNewForm({ leave_type: "Sick", from_date: todayStr, to_date: todayStr, reason: "" });
            setShowModal(true);
          }}
          className="text-xs !py-1.5 !px-3 shrink-0 self-start sm:self-auto max-w-fit"
        >
          Leave Request
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Leave application submitted successfully to faculty mentor.
        </div>
      )}

      {/* Leave Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Submitted Leave History</h2>
          <span className="text-xs text-[#64748B] font-mono">Total: {requests.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Total Days</th>
                <th className="p-3.5">Reason for Leave</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Faculty Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {requests.map((req) => {
                const totalDays = getLeaveDaysCount(req.from_date, req.to_date);
                return (
                  <tr key={req.leave_request_id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5 font-bold text-[#2563EB]">{req.leave_type}</td>
                    <td className="p-3.5 font-mono">{req.from_date} to {req.to_date}</td>
                    <td className="p-3.5 font-bold text-[#14B8A6]">
                      {totalDays} {totalDays === 1 ? "Day" : "Days"}
                    </td>
                    <td className="p-3.5 max-w-xs truncate">{req.reason}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${req.status === "Approved"
                          ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                          : req.status === "Rejected"
                            ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                            : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                          }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#64748B] font-medium">{req.remarks || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                Apply for Leave
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#64748B] mb-1">Leave Type</label>
                <select
                  value={newForm.leave_type}
                  onChange={(e) => setNewForm({ ...newForm, leave_type: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  <option value="Sick">Sick</option>
                  <option value="Personal">Personal</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date Selection with Min Date Protection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#64748B] mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={newForm.from_date}
                    onChange={(e) => {
                      const newFrom = e.target.value;
                      setNewForm({
                        ...newForm,
                        from_date: newFrom,
                        to_date: newForm.to_date < newFrom ? newFrom : newForm.to_date,
                      });
                    }}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#64748B] mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    min={newForm.from_date || todayStr}
                    value={newForm.to_date}
                    onChange={(e) => setNewForm({ ...newForm, to_date: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>
              </div>

              {/* Live Leave Days Calculation Summary */}
              {currentLeaveDays > 0 && (
                <div className="p-2.5 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] font-bold flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Requested Duration:
                  </span>
                  <span className="text-sm font-extrabold">
                    {currentLeaveDays} {currentLeaveDays === 1 ? "Day" : "Days"} Leave
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#64748B] mb-1">Reason for Request</label>
                <textarea
                  rows={3}
                  required
                  value={newForm.reason}
                  onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })}
                  placeholder="Provide detailed explanation..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" icon={Send}>
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaveRequest;
