import React, { useState, useEffect } from "react";
import { BookOpenCheck, Upload, CheckCircle2, Clock, AlertCircle, FileText, Download, Eye, Paperclip, X, Award, MessageSquareText } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";
import { readFileAsDataURL, getDisplayFileName, downloadFile, openFileInNewTab, parseMultipleFiles } from "../../utils/fileViewer";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [detailsAssignment, setDetailsAssignment] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleViewDocument = (fileUrl, title = "Document Preview") => {
    openFileInNewTab(fileUrl, title);
  };


  useEffect(() => {
    // 1. Restore local submissions from localStorage
    const savedSubsStr = localStorage.getItem("educonnect_student_submissions");
    let savedSubs = [];
    if (savedSubsStr) {
      try {
        savedSubs = JSON.parse(savedSubsStr);
      } catch (e) {
        console.error("Error parsing saved submissions:", e);
      }
    }
    setSubmissions(savedSubs);

    const fetchData = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.enrollment_no || loggedUser?.enrollmentNo || loggedUser?.identifier || "25CI2110016";

      try {
        const data = await studentApi.getAssignments(enrollmentNo);
        if (Array.isArray(data)) {
          const merged = data.map((item) => {
            const matchSub = savedSubs.find(
              (s) => String(s.assignment_id) === String(item.assignment_id) || (s.title && s.title === item.title)
            );
            if (matchSub || item.submitted || item.student_attachment) {
              return {
                ...item,
                submitted: true,
                student_attachment: item.student_attachment || matchSub?.attachment,
                student_file_name: item.student_file_name || matchSub?.file_name,
                submission_status: item.submission_status || matchSub?.submission_status || "Submitted",
                submission_date: item.submission_date || matchSub?.submission_date,
                obtained_marks: item.obtained_marks !== undefined ? item.obtained_marks : matchSub?.obtained_marks,
                feedback: item.feedback || matchSub?.feedback,
              };
            }
            return item;
          });
          setAssignments(merged);
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
      const enrollmentNo = loggedUser?.enrollment_no || loggedUser?.enrollmentNo || loggedUser?.identifier || "25CI2110016";

      let fileAttachmentVal = uploadFile.name;
      try {
        const dataUrl = await readFileAsDataURL(uploadFile);
        if (dataUrl) fileAttachmentVal = dataUrl;
      } catch (err) {
        console.error("Error reading student uploaded document Data URL:", err);
      }

      // Calculate submission status based on due date
      let calculatedStatus = "Timely";
      if (selectedAssignment.due_date) {
        try {
          const due = new Date(selectedAssignment.due_date);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          due.setHours(23, 59, 59, 999);
          if (now > due) {
            calculatedStatus = "Late";
          }
        } catch (e) { }
      }

      const newSubmission = {
        submission_id: `sub-${Date.now()}`,
        assignment_id: selectedAssignment.assignment_id,
        title: selectedAssignment.title,
        enrollment_no: enrollmentNo,
        file_name: uploadFile.name,
        attachment: fileAttachmentVal,
        submission_date: new Date().toISOString().replace("T", " ").substring(0, 16),
        submission_status: calculatedStatus,
        submitted: true,
      };

      try {
        await studentApi.submitAssignment(selectedAssignment.assignment_id, {
          enrollmentNo: enrollmentNo,
          enrollment_no: enrollmentNo,
          fileName: uploadFile.name,
          file_name: uploadFile.name,
          attachment: fileAttachmentVal,
          fileType: uploadFile.type || "application/pdf",
        });
      } catch (apiErr) {
        console.warn("Backend submit API error, using local persistent fallback:", apiErr);
      }

      // Save submission to local state and localStorage for persistence
      const updatedSubmissions = [
        newSubmission,
        ...submissions.filter((s) => String(s.assignment_id) !== String(selectedAssignment.assignment_id)),
      ];
      setSubmissions(updatedSubmissions);

      try {
        localStorage.setItem("educonnect_student_submissions", JSON.stringify(updatedSubmissions));
      } catch (storageErr) {
        console.warn("Storage quota reached, saving metadata fallback:", storageErr);
        const metadataOnlySubs = updatedSubmissions.map((s) => ({
          ...s,
          attachment: s.file_name,
        }));
        try {
          localStorage.setItem("educonnect_student_submissions", JSON.stringify(metadataOnlySubs));
        } catch (e) { }
      }

      setAssignments((prev) =>
        prev.map((a) =>
          String(a.assignment_id) === String(selectedAssignment.assignment_id) || a.title === selectedAssignment.title
            ? {
              ...a,
              submitted: true,
              student_attachment: fileAttachmentVal,
              student_file_name: uploadFile.name,
              submission_status: calculatedStatus,
              submission_date: newSubmission.submission_date,
            }
            : a
        )
      );

      notifySuccess(`Assignment '${selectedAssignment.title}' submitted successfully!`);
      setSelectedAssignment(null);
      setUploadFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      notifyError(err.response?.data?.message || "Failed to submit assignment. Please try again.");
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

      {/* Assignment List Grid / Empty State */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center shadow-xs space-y-3">
          <BookOpenCheck className="w-10 h-10 text-[#64748B] mx-auto opacity-60" />
          <h3 className="text-sm font-bold text-[#1E293B]">No Assignments for Current Semester</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            There are currently no assignments assigned for your current semester subjects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
              onClick={() => setDetailsAssignment(asgn)}
              className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 shadow-xs flex flex-col justify-between space-y-2.5 hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-200 cursor-pointer"
            >
              <div className="space-y-2">
                {/* Header: Marks & Due Date */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-extrabold">
                    Total: {asgn.total_marks} Marks
                  </span>
                  <span className="font-mono text-[#64748B] font-semibold">Due: {asgn.due_date}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#1E293B] leading-snug truncate" title={asgn.title}>{asgn.title}</h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2 mt-1">{asgn.description}</p>
                </div>

                {/* Reference Attachment Pills - Clickable Teacher Attachments */}
                {(() => {
                  const refFiles = parseMultipleFiles(asgn.attachment, asgn.file_name, asgn.title);
                  if (refFiles.length === 0) return null;
                  return (
                    <div className="space-y-1 pt-0.5">
                      <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">
                        Reference Files ({refFiles.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {refFiles.map((file, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(file.path, file.name);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-2 py-0.5 rounded-md border border-[#2563EB]/20 font-bold cursor-pointer transition-all truncate max-w-full"
                            title={`Click to view ${file.name}`}
                          >
                            <Paperclip className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Submitted File View Section if Student Submitted */}
                {isSubmitted && subAttachment && (
                  <div className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-1.5 text-[11px]">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[9px] font-bold text-[#64748B] uppercase block">Your File</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(subAttachment, "My Submission Document");
                        }}
                        className="font-mono font-bold text-[#2563EB] text-[10px] hover:underline cursor-pointer flex items-center gap-1 truncate"
                        title="Click file name to view document in a new tab"
                      >
                        <Paperclip className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{getDisplayFileName(subFileName, subAttachment, "My_Submission")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Action */}
              <div className="border-t border-[#E2E8F0] pt-2 flex items-center justify-between gap-2 text-xs">
                <div>
                  {isGraded ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 font-bold text-[9px]">
                      <Award className="w-3 h-3" /> Graded {obtainedMarks !== null ? `(${obtainedMarks}/${asgn.total_marks})` : ""}
                    </span>
                  ) : isSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-bold text-[9px]">
                      <CheckCircle2 className="w-3 h-3" /> Submitted ({subStatus})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 font-bold text-[9px]">
                      <Clock className="w-3 h-3" /> Pending Upload
                    </span>
                  )}
                </div>

                {!isGraded && (
                  <Button
                    variant={isSubmitted ? "outline" : "accent"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAssignment(asgn);
                    }}
                    className="text-[11px] py-1 px-2.5"
                  >
                    {isSubmitted ? "Re-upload" : "Submit File"}
                  </Button>
                )}
              </div>

              {/* Faculty Evaluation & Remarks Section - Redesigned to show only feedback and marks */}
              {isGraded && (
                <div className="p-2.5 bg-[#2563EB]/5 rounded-lg border border-[#2563EB]/20 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#64748B] text-[10px] font-bold">Marks:</span>
                    <span className="font-extrabold text-[#2563EB] font-mono text-[11px]">
                      {obtainedMarks !== null && obtainedMarks !== undefined ? `${obtainedMarks} / ${asgn.total_marks}` : `Max: ${asgn.total_marks}`}
                    </span>
                  </div>

                  {feedback && (
                    <div className="space-y-0.5 pt-1 border-t border-[#2563EB]/15">
                      <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Feedback:</span>
                      <p className="text-[11px] text-[#1E293B] bg-white p-2 rounded border border-[#E2E8F0] leading-relaxed font-medium">
                        "{feedback}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

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
                    <div className="p-3.5 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] text-[10px] font-bold">Marks:</span>
                        <span className="font-extrabold text-[#2563EB] font-mono text-[11px]">
                          {obtMarks !== null ? `${obtMarks} / ${selectedAssignment.total_marks}` : `Max: ${selectedAssignment.total_marks}`}
                        </span>
                      </div>
                      {fb && (
                        <div className="space-y-0.5 pt-1 border-t border-[#2563EB]/15">
                          <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Feedback:</span>
                          <p className="text-xs text-[#1E293B] bg-white p-2 rounded-lg border border-[#E2E8F0] font-medium leading-relaxed">
                            "{fb}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Student Already Submitted, Show Previously Uploaded File Box without View/Download buttons */}
                  {prevAttachment && (
                    <div className="p-3.5 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-wider block">Previously Uploaded File</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold border border-[#22C55E]/20">
                          {subStatus}
                        </span>
                      </div>

                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleViewDocument(prevAttachment, "Previously Uploaded File")}
                          className="font-mono font-bold text-[#2563EB] text-xs hover:underline cursor-pointer flex items-center gap-1.5 truncate max-w-full"
                          title="Click file name to view document in a new tab"
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{getDisplayFileName(prevFileName, prevAttachment, "My_Submission")}</span>
                        </button>
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

      {/* STUDENT ASSIGNMENT DETAILS POP-UP MODAL (CLICK ON CARD) */}
      {detailsAssignment && (() => {
        const sub = submissions.find(
          (s) => String(s.assignment_id) === String(detailsAssignment.assignment_id) || (s.title && s.title === detailsAssignment.title)
        );
        const isSub =
          Boolean(detailsAssignment.submitted) ||
          Boolean(detailsAssignment.student_attachment) ||
          Boolean(sub?.attachment) ||
          Boolean(sub?.submitted);
        const subAtt = detailsAssignment.student_attachment || sub?.attachment;
        const subFname = detailsAssignment.student_file_name || sub?.file_name;
        const subStat = detailsAssignment.submission_status || sub?.submission_status || "Submitted";
        const subDateVal = detailsAssignment.submission_date || sub?.submission_date;
        const obtMarks = detailsAssignment.obtained_marks !== undefined && detailsAssignment.obtained_marks !== null
          ? detailsAssignment.obtained_marks
          : (sub?.obtained_marks !== undefined && sub?.obtained_marks !== null ? sub?.obtained_marks : null);
        const fb = detailsAssignment.feedback || detailsAssignment.remarks || sub?.feedback || sub?.remarks;
        const isGrad = (obtMarks !== null && obtMarks !== undefined) || Boolean(fb);
        const refFiles = parseMultipleFiles(detailsAssignment.attachment, detailsAssignment.file_name, detailsAssignment.title);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 my-8 animate-fade-in max-h-[90vh] flex flex-col">
              {/* Header with Title and Close Cross Icon */}
              <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3 gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1E293B] leading-snug break-words">
                    {detailsAssignment.title}
                  </h3>
                </div>
                <button
                  onClick={() => setDetailsAssignment(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                  title="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Meta Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Subject</span>
                    <p className="font-bold text-[#1E293B] text-xs">
                      {detailsAssignment.subject_name || detailsAssignment.subject_code || "Academic Course"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Submission Deadline</span>
                    <p className="font-mono font-bold text-[#1E293B] text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                      {detailsAssignment.due_date || "No deadline"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Total Weightage</span>
                    <p className="font-bold text-[#2563EB] text-xs font-mono">{detailsAssignment.total_marks} Points</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">My Status</span>
                    <p className="font-bold text-xs">
                      {isGrad ? (
                        <span className="text-[#2563EB] font-mono">Graded ({obtMarks} / {detailsAssignment.total_marks})</span>
                      ) : isSub ? (
                        <span className="text-[#22C55E]">Submitted ({subStat})</span>
                      ) : (
                        <span className="text-[#F97316]">Submission Pending</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Instructions / Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Instructions & Description
                  </span>
                  <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                    {detailsAssignment.description || "No specific instructions provided for this assignment."}
                  </div>
                </div>

                {/* Reference Documents */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Faculty Reference Attachments ({refFiles.length})
                  </span>
                  {refFiles.length === 0 ? (
                    <p className="text-[11px] text-[#94A3B8] italic">No reference attachments provided.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {refFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] gap-2 hover:border-[#2563EB]/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="w-4 h-4 text-[#2563EB] shrink-0" />
                            <span className="font-mono text-xs text-[#1E293B] font-semibold truncate" title={file.name}>
                              {file.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleViewDocument(file.path, file.name)}
                              className="px-2 py-1 text-[11px] font-semibold text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                              title="View reference document"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                            <button
                              onClick={() => downloadFile(file.path, file.name)}
                              className="p-1 text-[#64748B] hover:text-[#1E293B] hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              title="Download reference document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student's Uploaded Submission */}
                {isSub && (
                  <div className="space-y-2 pt-1 border-t border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      My Submission Details
                    </span>
                    <div className="p-3.5 bg-[#22C55E]/5 rounded-xl border border-[#22C55E]/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-4 h-4 text-[#22C55E] shrink-0" />
                          <span className="font-mono font-bold text-xs text-[#1E293B] truncate">
                            {getDisplayFileName(subFname, subAtt, "My_Submission")}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold border border-[#22C55E]/30 shrink-0">
                          {subStat}
                        </span>
                      </div>
                      {subDateVal && (
                        <p className="text-[10px] text-[#64748B] font-mono">
                          Submitted on: <span className="font-semibold text-[#1E293B]">{subDateVal}</span>
                        </p>
                      )}
                      {subAtt && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleViewDocument(subAtt, "My Submission Document")}
                            className="px-2.5 py-1 text-xs font-semibold text-[#22C55E] bg-white border border-[#22C55E]/30 rounded-lg hover:bg-[#22C55E] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Submitted File
                          </button>
                          <button
                            onClick={() => downloadFile(subAtt, subFname || "My_Submission")}
                            className="px-2.5 py-1 text-xs font-semibold text-[#64748B] bg-white border border-[#E2E8F0] rounded-lg hover:text-[#1E293B] hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Faculty Evaluation & Remarks */}
                {isGrad && (
                  <div className="space-y-2 pt-1 border-t border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Faculty Evaluation & Feedback
                    </span>
                    <div className="p-3.5 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 space-y-2">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#64748B] text-xs font-bold">Awarded Marks:</span>
                        <span className="font-extrabold text-[#2563EB] font-mono text-sm">
                          {obtMarks !== null ? `${obtMarks} / ${detailsAssignment.total_marks}` : `Max: ${detailsAssignment.total_marks}`}
                        </span>
                      </div>
                      {fb && (
                        <div className="space-y-1 pt-1.5 border-t border-[#2563EB]/15">
                          <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Teacher's Feedback:</span>
                          <p className="text-xs text-[#1E293B] bg-white p-2.5 rounded-lg border border-[#E2E8F0] leading-relaxed font-medium">
                            "{fb}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <div>
                  {!isGrad && (
                    <Button
                      variant="accent"
                      size="sm"
                      icon={Upload}
                      onClick={() => {
                        const target = detailsAssignment;
                        setDetailsAssignment(null);
                        setSelectedAssignment(target);
                      }}
                      className="text-xs"
                    >
                      {isSub ? "Re-upload Assignment" : "Submit Assignment"}
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailsAssignment(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default StudentAssignments;

