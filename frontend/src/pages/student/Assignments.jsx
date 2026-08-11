import React, { useState } from "react";
import { BookOpenCheck, Upload, CheckCircle2, Clock, AlertCircle, FileText, Download, Eye, Paperclip, X } from "lucide-react";
import Button from "../../components/common/Button";
import { mockAssignments, mockAssignmentSubmissions } from "../../data/mockData";

const StudentAssignments = () => {
  const [submissions, setSubmissions] = useState(mockAssignmentSubmissions);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    if (!selectedAssignment || !uploadFile) return;

    const existingSub = submissions.find((s) => s.assignment_id === selectedAssignment.assignment_id);

    if (existingSub) {
      // Re-upload / Update existing submission
      setSubmissions(
        submissions.map((s) =>
          s.assignment_id === selectedAssignment.assignment_id
            ? {
                ...s,
                submission_date: new Date().toISOString().split("T")[0],
                attachment: uploadFile.name,
                submission_status: "Timely",
                updated_at: new Date().toISOString(),
              }
            : s
        )
      );
    } else {
      // Create new submission
      const newSub = {
        submission_id: `sub-00${submissions.length + 1}`,
        assignment_id: selectedAssignment.assignment_id,
        student_id: "stu-001",
        submission_date: new Date().toISOString().split("T")[0],
        attachment: uploadFile.name,
        obtained_marks: null,
        feedback: null,
        submission_status: "Timely",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSubmissions([newSub, ...submissions]);
    }

    setSelectedAssignment(null);
    setUploadFile(null);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Assignments</h1>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Assignment submitted successfully!
        </div>
      )}

      {/* Assignment List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockAssignments.map((asgn) => {
          const submission = submissions.find((s) => s.assignment_id === asgn.assignment_id);
          return (
            <div
              key={asgn.assignment_id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header: Marks & Due Date */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[11px]">
                    Total Marks: {asgn.total_marks}
                  </span>
                  <span className="font-mono text-[#64748B] text-[11px] font-semibold">Due Date: {asgn.due_date}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B] leading-snug">{asgn.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 mt-1.5">{asgn.description}</p>
                </div>

                {/* Reference Attachment Pill - Clickable Teacher Attachment */}
                {asgn.attachment && (
                  <div className="pt-1">
                    <button
                      onClick={() =>
                        setViewFileModal({
                          attachment: asgn.attachment,
                          student_name: "Teacher / Faculty Spec Reference Doc",
                          enrollment_no: "Assignment Spec Doc",
                          submission_date: `Due Date: ${asgn.due_date}`,
                          submission_status: "Teacher Reference Document",
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-3 py-1 rounded-lg border border-[#2563EB]/20 font-bold cursor-pointer transition-all"
                      title="Click file name to view teacher reference document"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Teacher File: {asgn.attachment}
                    </button>
                  </div>
                )}

                {/* Submitted File View Section if Student Submitted */}
                {submission && submission.attachment && (
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase block">Your Uploaded File</span>
                      <button
                        onClick={() => setViewFileModal(submission)}
                        className="font-mono font-bold text-[#2563EB] text-xs hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                        title="Click file name to open document"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> {submission.attachment}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Action */}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between text-xs">
                <div>
                  {submission ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-bold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Submitted ({submission.submission_status || "Timely"})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 font-bold text-[10px]">
                      <Clock className="w-3.5 h-3.5" /> Pending Upload
                    </span>
                  )}
                </div>

                <Button
                  variant={submission ? "outline" : "accent"}
                  size="sm"
                  onClick={() => setSelectedAssignment(asgn)}
                  className="text-xs"
                >
                  {submission ? "Re-upload / View Status" : "Submit File"}
                </Button>
              </div>

              {submission && submission.obtained_marks !== null && (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                  <p className="font-bold text-[#1E293B]">
                    Faculty Grade & Remarks:{" "}
                    <span className="text-[#2563EB]">
                      {submission.obtained_marks} / {asgn.total_marks}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#64748B]">{submission.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload / Re-upload Modal Dialog */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                Upload Assignment Submission
              </h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
              <p className="font-extrabold text-[#1E293B] text-sm">{selectedAssignment.title}</p>
              <p className="text-[#64748B]">Due Date: <span className="font-mono font-semibold text-[#1E293B]">{selectedAssignment.due_date}</span> • Max Marks: <span className="font-bold text-[#2563EB]">{selectedAssignment.total_marks}</span></p>
            </div>

            {/* If Student Already Submitted, Show Previous Upload Box */}
            {(() => {
              const existingSub = submissions.find((s) => s.assignment_id === selectedAssignment.assignment_id);
              if (existingSub && existingSub.attachment) {
                return (
                  <div className="p-3 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase block">Currently Uploaded File</span>
                      <button
                        onClick={() => setViewFileModal(existingSub)}
                        className="font-mono font-bold text-[#2563EB] text-xs hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                        title="Click file name to open document"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> {existingSub.attachment}
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#1E293B]">Select Assignment Document File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/10 file:text-[#2563EB] cursor-pointer bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setSelectedAssignment(null)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" icon={Upload}>
                  Submit Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Uploaded File Viewer Modal */}
      {viewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  My Uploaded Assignment File
                </h3>
              </div>
              <button
                onClick={() => setViewFileModal(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Box */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-bold text-[10px] border border-[#22C55E]/20">
                    Submission Status: {viewFileModal.submission_status || "Submitted"}
                  </span>
                  <span className="font-mono text-[#64748B] text-[11px]">
                    Submission Date: {viewFileModal.submission_date}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#1E293B]">File Name: <span className="font-mono text-[#2563EB]">{viewFileModal.attachment}</span></h4>
              </div>

              {/* Document Container */}
              <div className="p-6 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 text-center space-y-3">
                <Paperclip className="w-10 h-10 text-[#2563EB] mx-auto animate-bounce" />
                <div>
                  <h5 className="text-sm font-extrabold text-[#1E293B] font-mono truncate max-w-xs mx-auto">
                    {viewFileModal.attachment || "assignment_submission.zip"}
                  </h5>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Your Official Assignment File Submitted to Faculty
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Download}
                    onClick={() => alert(`Downloading your file: ${viewFileModal.attachment}...`)}
                    className="text-xs"
                  >
                    Download My File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => alert(`Opening ${viewFileModal.attachment} in document viewer...`)}
                    className="text-xs"
                  >
                    Open Document Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
