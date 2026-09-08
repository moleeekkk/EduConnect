import React, { useState, useEffect } from "react";
import { BadgeAlert, CheckCircle2, XCircle, Clock, X } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherLeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarksText, setRemarksText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesData, stuData] = await Promise.all([
          teacherApi.getLeaveRequests(),
          teacherApi.getStudents(),
        ]);
        setRequests(Array.isArray(leavesData) ? leavesData : []);
        setStudents(Array.isArray(stuData) ? stuData : []);
      } catch (err) {
        console.error("Leave management load error:", err);
      }
    };
    fetchData();
  }, []);

  const handleReview = async (status) => {
    if (!selectedReq) return;
    try {
      const id = selectedReq.leave_request_id;
      await teacherApi.updateLeaveStatus(id, status);
      setRequests(
        requests.map((r) =>
          r.leave_request_id === id
            ? {
              ...r,
              status,
              reviewed_by: "teach-001",
              reviewed_date: new Date().toISOString().split("T")[0],
              remarks: remarksText || (status === "Approved" ? "Approved." : "Rejected."),
            }
            : r
        )
      );
      if (status === "Approved") {
        notifySuccess("Leave application Approved and status updated in database!");
      } else {
        notifySuccess("Leave application Rejected and record updated!");
      }
      setSelectedReq(null);
    } catch (err) {
      console.error("Update leave error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to update leave status.";
      notifyError(`Failed to update leave request: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Leave Management</h1>
        </div>
      </div>

      {/* Submitted Applications Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E293B]">Submitted Student Leave Applications</h2>
          <span className="text-xs text-[#64748B] font-mono">Total: {requests.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Reason for Request</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Faculty Remarks</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {requests.map((req) => {
                const stu = students.find((s) => s.student_id === req.student_id || s.id === req.student_id);
                return (
                  <tr key={req.leave_request_id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5">
                      <div className="font-extrabold text-[#1E293B]">
                        {stu ? `${stu.first_name} ${stu.last_name}` : "Student"}
                      </div>
                      <span className="font-mono text-[10px] text-[#2563EB] font-bold">
                        {stu ? stu.enrollment_no : "25CI2110016"}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#2563EB] font-bold">{req.leave_type}</td>
                    <td className="p-3.5 font-mono font-medium">{req.from_date} to {req.to_date}</td>
                    <td className="p-3.5 max-w-xs truncate font-medium text-[#64748B]">{req.reason}</td>
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
                    <td className="p-3.5 text-right">
                      {req.status === "Pending" ? (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setSelectedReq(req);
                            setRemarksText("");
                          }}
                          className="text-xs"
                        >
                          Review
                        </Button>
                      ) : (
                        <span className="text-[11px] text-[#64748B] font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Application Pop-up Modal with Cross X Icon */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            {/* Modal Header with Close Cross Button */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                Review Leave Application
              </h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#64748B] font-bold uppercase">Leave Type</span>
                <span className="font-bold text-[#2563EB]">{selectedReq.leave_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#64748B] font-bold uppercase">Requested Duration</span>
                <span className="font-mono font-bold text-[#1E293B]">{selectedReq.from_date} to {selectedReq.to_date}</span>
              </div>
              <p className="text-[#64748B] pt-1 border-t border-[#E2E8F0] leading-relaxed">
                <strong className="text-[#1E293B]">Reason:</strong> {selectedReq.reason}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">Faculty Remarks</label>
                <textarea
                  rows={3}
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="e.g. Approved. Complete missed lab assignment after returning."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" onClick={() => handleReview("Rejected")} className="text-xs text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10">
                  Reject Application
                </Button>
                <Button variant="accent" size="sm" onClick={() => handleReview("Approved")} className="text-xs">
                  Approve Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeaveManagement;
