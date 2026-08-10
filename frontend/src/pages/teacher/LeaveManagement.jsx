import React, { useState } from "react";
import { BadgeAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { mockLeaveRequests, mockStudents } from "../../data/mockData";

const TeacherLeaveManagement = () => {
  const [requests, setRequests] = useState(mockLeaveRequests);
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarksText, setRemarksText] = useState("");

  const handleReview = (status) => {
    if (!selectedReq) return;
    setRequests(
      requests.map((r) =>
        r.leave_request_id === selectedReq.leave_request_id
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
    setSelectedReq(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Student Leave Management (leave_requests)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Review, Approve, or Reject student leave applications</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#1E293B]">Submitted Applications</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Leave Type (leave_type)</th>
                <th className="p-3.5">Duration (from_date - to_date)</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Status (status)</th>
                <th className="p-3.5">Faculty Remarks</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {requests.map((req) => {
                const stu = mockStudents.find((s) => s.student_id === req.student_id);
                return (
                  <tr key={req.leave_request_id} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-bold">{stu ? `${stu.first_name} ${stu.last_name}` : "Student"}</td>
                    <td className="p-3.5 text-[#2563EB] font-semibold">{req.leave_type}</td>
                    <td className="p-3.5 font-mono">{req.from_date} to {req.to_date}</td>
                    <td className="p-3.5 max-w-xs truncate">{req.reason}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === "Approved"
                            ? "bg-[#22C55E]/10 text-[#22C55E]"
                            : req.status === "Rejected"
                            ? "bg-[#EF4444]/10 text-[#EF4444]"
                            : "bg-[#F59E0B]/10 text-[#F59E0B]"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#64748B]">{req.remarks || "-"}</td>
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
                          Review Application
                        </Button>
                      ) : (
                        <span className="text-[10px] text-[#64748B]">Reviewed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Review Leave Application
            </h3>

            <div className="text-xs space-y-1">
              <p className="font-bold text-[#2563EB]">Leave Type: {selectedReq.leave_type}</p>
              <p className="text-[#64748B]">Reason: {selectedReq.reason}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1">Remarks for Student (remarks)</label>
                <textarea
                  rows={3}
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="e.g. Approved. Complete missed lab after returning."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" onClick={() => handleReview("Rejected")} className="text-xs text-[#EF4444] border-[#EF4444]/30">
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
