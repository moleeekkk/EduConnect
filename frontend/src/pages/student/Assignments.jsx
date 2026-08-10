import React, { useState } from "react";
import { BookOpenCheck, Upload, CheckCircle2, Clock, AlertCircle, FileText, Download } from "lucide-react";
import Button from "../../components/common/Button";
import { mockAssignments, mockAssignmentSubmissions, mockSubjects } from "../../data/mockData";

const StudentAssignments = () => {
  const [submissions, setSubmissions] = useState(mockAssignmentSubmissions);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    if (!selectedAssignment || !uploadFile) return;

    const newSub = {
      submission_id: `sub-00${submissions.length + 1}`,
      assignment_id: selectedAssignment.assignment_id,
      student_id: "stu-001",
      submission_date: new Date().toISOString(),
      attachment: `/uploads/${uploadFile.name}`,
      obtained_marks: null,
      feedback: null,
      submission_status: "Submitted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSubmissions([newSub, ...submissions]);
    setSelectedAssignment(null);
    setUploadFile(null);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Assignments & Submissions (assignments)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">View course assignments, upload submission files, and view teacher feedback</p>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Assignment submitted successfully!
        </div>
      )}

      {/* Assignment List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockAssignments.map((asgn) => {
          const submission = submissions.find((s) => s.assignment_id === asgn.assignment_id);
          return (
            <div key={asgn.assignment_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold">
                    Total Marks: {asgn.total_marks}
                  </span>
                  <span className="font-mono text-[#64748B]">Due Date: {asgn.due_date}</span>
                </div>

                <h3 className="text-sm font-bold text-[#1E293B]">{asgn.title}</h3>
                <p className="text-[#64748B] line-clamp-3">{asgn.description}</p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] font-semibold cursor-pointer">
                    <FileText className="w-3.5 h-3.5" /> Spec Attachment: {asgn.attachment}
                  </span>
                </div>
              </div>

              {/* Status & Action */}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between text-xs">
                <div>
                  {submission ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Submitted ({submission.submission_status})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] font-bold text-[10px]">
                      <Clock className="w-3 h-3" /> Pending Upload
                    </span>
                  )}
                </div>

                <Button
                  variant={submission ? "outline" : "accent"}
                  size="sm"
                  onClick={() => setSelectedAssignment(asgn)}
                  className="text-xs"
                >
                  {submission ? "Re-upload / View" : "Submit File"}
                </Button>
              </div>

              {submission && submission.obtained_marks !== null && (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                  <p className="font-bold text-[#1E293B]">
                    Teacher Feedback & Marks: <span className="text-[#2563EB]">{submission.obtained_marks} / {asgn.total_marks}</span>
                  </p>
                  <p className="text-[11px] text-[#64748B]">{submission.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Modal Dialog */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              Upload Submission File (assignment_submissions)
            </h3>

            <div className="text-xs space-y-1">
              <p className="font-bold text-[#2563EB]">{selectedAssignment.title}</p>
              <p className="text-[#64748B]">Due Date: {selectedAssignment.due_date} • Max Marks: {selectedAssignment.total_marks}</p>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#64748B] mb-1">Select File to Upload (attachment)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
    </div>
  );
};

export default StudentAssignments;
