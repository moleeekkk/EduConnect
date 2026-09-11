import React, { useState, useEffect } from "react";
import { BookOpenCheck, Upload, CheckCircle2, Clock, AlertCircle, FileText, Download, Eye, Paperclip, X, Award, MessageSquareText } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";
import { readFileAsDataURL, getDisplayFileName, downloadFile, openFileInNewTab } from "../../utils/fileViewer";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleViewDocument = (fileUrl, title = "Document Preview") => {
    openFileInNewTab(fileUrl, title);
  };


  useEffect(() => {
    const userStr = localStorage.getItem("educonnect_user");
    const loggedUser = userStr ? JSON.parse(userStr) : null;
    const enrollmentNo = loggedUser?.enrollment_no || loggedUser?.enrollmentNo || loggedUser?.identifier || "";

    const fetchData = async () => {
      try {
        const data = await studentApi.getAssignments(enrollmentNo);
        if (Array.isArray(data)) {
          setAssignments(data);
        }
      } catch (err) {
        console.error("Assignments load error:", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !uploadFile) {
      notifyError("Please select a file to upload.");
      return;
    }

    try {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.enrollment_no || loggedUser?.enrollmentNo || loggedUser?.identifier || "";

      let fileAttachmentVal = uploadFile.name;
      try {
        const dataUrl = await readFileAsDataURL(uploadFile);
        if (dataUrl) fileAttachmentVal = dataUrl;
      } catch (err) {
        console.error("Error reading student uploaded document Data URL:", err);
      }

      await studentApi.submitAssignment(selectedAssignment.assignment_id, {
        enrollmentNo: enrollmentNo,
        enrollment_no: enrollmentNo,
        fileName: uploadFile.name,
        file_name: uploadFile.name,
        attachment: fileAttachmentVal,
        fileType: uploadFile.type || "application/pdf",
      });

      notifySuccess(`Assignment '${selectedAssignment.title}' submitted successfully!`);
      setSelectedAssignment(null);
      setUploadFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      // Re-fetch authoritative assignment list from server
      const dbData = await studentApi.getAssignments(enrollmentNo);
      if (Array.isArray(dbData)) {
        setAssignments(dbData);
      }
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to submit assignment. Please try again.";
      notifyError(errMsg);
    }
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
        {assignments.map((asgn) => {
          const submission = submissions.find(
            (s) => String(s.assignment_id) === String(asgn.assignment_id) || (s.title && s.title === asgn.title)
          );
          const isSubmitted =
            Boolean(asgn.submitted) ||
            Boolean(asgn.student_attachment) ||
            Boolean(submission?.attachment) ||
            Boolean(submission?.submitted);
          const subAttachment = asgn.student_attachment || submission?.attachment || "Submission_Document";
          const subFileName = asgn.student_file_name || submission?.file_name || "Submission_Document";
          const subStatus = asgn.submission_status || submission?.submission_status || "Submitted";
          const obtainedMarks = asgn.obtained_marks !== undefined && asgn.obtained_marks !== null
            ? asgn.obtained_marks
            : (submission?.obtained_marks !== undefined && submission?.obtained_marks !== null ? submission?.obtained_marks : null);
          const feedback = asgn.feedback || asgn.remarks || submission?.feedback || submission?.remarks;
          const isGraded = (obtainedMarks !== null && obtainedMarks !== undefined) || Boolean(feedback);

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
                      onClick={() => handleViewDocument(asgn.attachment, asgn.title)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-3 py-1 rounded-lg border border-[#2563EB]/20 font-bold cursor-pointer transition-all"
                      title="Click file name to view teacher reference document in a new tab"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Teacher File: {getDisplayFileName(asgn.file_name, asgn.attachment, asgn.title)}
                    </button>
                  </div>
                )}

                {/* Submitted File View Section if Student Submitted */}
                {isSubmitted && subAttachment && (
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase block">Your Uploaded File</span>
                      <button
                        onClick={() => handleViewDocument(subAttachment, "My Submission Document")}
                        className="font-mono font-bold text-[#2563EB] text-xs hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                        title="Click file name to view document in a new tab"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> {getDisplayFileName(subFileName, subAttachment, "My_Submission")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Action */}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between text-xs">
                <div>
                  {isGraded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 font-bold text-[10px]">
                      <Award className="w-3.5 h-3.5" /> Graded {obtainedMarks !== null ? `(${obtainedMarks}/${asgn.total_marks})` : ""}
                    </span>
                  ) : isSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-bold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Submitted ({subStatus})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 font-bold text-[10px]">
                      <Clock className="w-3.5 h-3.5" /> Pending Upload
                    </span>
                  )}
                </div>

                <Button
                  variant={isSubmitted ? "outline" : "accent"}
                  size="sm"
                  onClick={() => setSelectedAssignment(asgn)}
                  className="text-xs"
                >
                  {isSubmitted ? "Re-upload / View Status" : "Submit File"}
                </Button>
              </div>

              {/* Faculty Evaluation & Remarks Section */}
              {isGraded && (
                <div className="p-3.5 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2563EB]/15 pb-2">
                    <span className="font-extrabold text-[#1E293B] flex items-center gap-1.5 text-xs">
                      <Award className="w-4 h-4 text-[#2563EB]" /> Faculty Evaluation & Grade
                    </span>
                    {obtainedMarks !== null && obtainedMarks !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white font-bold text-[11px] font-mono">
                        Score: {obtainedMarks} / {asgn.total_marks}
                      </span>
                    )}
                  </div>

                  {feedback ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block flex items-center gap-1">
                        <MessageSquareText className="w-3 h-3 text-[#2563EB]" /> Teacher Remarks / Feedback:
                      </span>
                      <p className="text-xs text-[#1E293B] bg-white p-2.5 rounded-lg border border-[#E2E8F0] leading-relaxed font-medium">
                        "{feedback}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#64748B] italic">Evaluated by faculty.</p>
                  )}
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
            {(() => {
              const existingSub = submissions.find(
                (s) => String(s.assignment_id) === String(selectedAssignment.assignment_id) || (s.title && s.title === selectedAssignment.title)
              );
              const prevAttachment = selectedAssignment.student_attachment || existingSub?.attachment;
              const prevFileName = selectedAssignment.student_file_name || existingSub?.file_name;
              const subDate = selectedAssignment.submission_date || existingSub?.submission_date;
              const subStatus = selectedAssignment.submission_status || existingSub?.submission_status || "Submitted";
              const isResubmit = Boolean(prevAttachment || selectedAssignment.submitted || existingSub);

              const obtMarks = selectedAssignment.obtained_marks !== undefined && selectedAssignment.obtained_marks !== null
                ? selectedAssignment.obtained_marks
                : (existingSub?.obtained_marks !== undefined && existingSub?.obtained_marks !== null ? existingSub?.obtained_marks : null);
              const fb = selectedAssignment.feedback || selectedAssignment.remarks || existingSub?.feedback || existingSub?.remarks;

              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-base font-bold text-[#1E293B]">
                      {isResubmit ? "Resubmit Assignment Document" : "Upload Assignment Submission"}
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

                  {/* If Graded by Teacher, Show Faculty Grade & Remarks Box inside Modal */}
                  {(obtMarks !== null || fb) && (
                    <div className="p-3.5 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-[#2563EB]/15 pb-2">
                        <span className="text-[11px] font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-[#2563EB]" /> Faculty Evaluation & Grade
                        </span>
                        {obtMarks !== null && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white font-bold text-[10px] font-mono">
                            Score: {obtMarks} / {selectedAssignment.total_marks}
                          </span>
                        )}
                      </div>
                      {fb && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#64748B] font-semibold flex items-center gap-1">
                            <MessageSquareText className="w-3 h-3 text-[#2563EB]" /> Teacher Remarks:
                          </span>
                          <p className="text-xs text-[#1E293B] bg-white p-2 rounded-lg border border-[#E2E8F0] font-medium leading-relaxed">
                            "{fb}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Student Already Submitted, Show Previously Uploaded File Box */}
                  {prevAttachment && (
                    <div className="p-3.5 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-wider block">Previously Uploaded File</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold border border-[#22C55E]/20">
                          {subStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleViewDocument(prevAttachment, "Previously Uploaded File")}
                          className="font-mono font-bold text-[#2563EB] text-xs hover:underline cursor-pointer flex items-center gap-1.5 truncate max-w-[200px]"
                          title="Click file name to view document in a new tab"
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{getDisplayFileName(prevFileName, prevAttachment, "My_Submission")}</span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleViewDocument(prevAttachment, "Previously Uploaded File")}
                            className="px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg text-[11px] font-semibold text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                            title="View document in new tab"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadFile(prevAttachment, prevFileName || "My_Submission")}
                            className="px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg text-[11px] font-semibold text-[#64748B] hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </div>
                      </div>
                      {subDate && (
                        <p className="text-[10px] text-[#64748B] font-mono">Uploaded on: {subDate}</p>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-[#1E293B]">
                        {isResubmit ? "Select New Document to Replace Uploaded File" : "Select Assignment Document File"}
                      </label>
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
                        {isResubmit ? "Resubmit Assignment" : "Submit Assignment"}
                      </Button>
                    </div>
                  </form>
                </>
              );
            })()}
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
                    {getDisplayFileName(viewFileModal.file_name, viewFileModal.attachment, "My_Submission")}
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
                    onClick={() => downloadFile(viewFileModal.attachment, viewFileModal.file_name || "My_Submission")}
                    className="text-xs"
                  >
                    Download My File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewDocument(viewFileModal.attachment, "Document Preview")}
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

