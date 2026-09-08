import React, { useState, useEffect } from "react";
import { FileQuestion, Download, Eye, Paperclip, X, FileText } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentOldQuestionPaper = () => {
  const [papers, setPapers] = useState([]);
  const [viewFileModal, setViewFileModal] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const data = await studentApi.getOldQuestionPapers();
        if (Array.isArray(data)) {
          setPapers(data);
        }
      } catch (err) {
        console.error("Old question papers load error:", err);
      }
    };
    fetchPapers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Old Question Papers</h1>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((item) => {
          const fileName = item.file_path ? item.file_path.split("/").pop() : "past_paper.pdf";
          return (
            <div
              key={item.resource_id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header Badge & Date */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[11px] border border-[#2563EB]/20">
                    Question Paper
                  </span>
                  <span className="font-mono text-[#64748B] text-[11px] font-semibold">{item.uploaded_date}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B] leading-snug">{item.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 mt-1.5">{item.description}</p>
                </div>

                {/* File Attachment Pill - Clickable File Name */}
                <div className="pt-1">
                  <button
                    onClick={() => setViewFileModal(item)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-3 py-1 rounded-lg border border-[#2563EB]/20 font-bold cursor-pointer transition-all truncate max-w-full"
                    title="Click file name to open document"
                  >
                    <Paperclip className="w-3.5 h-3.5 shrink-0" /> {fileName}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => alert(`Downloading Question Paper PDF: ${item.file_path}...`)}
                  className="text-xs"
                >
                  Download PDF
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Question Paper Viewer Modal */}
      {viewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  Previous Year Question Paper Preview
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

            {/* Paper Details Card */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[10px]">
                    Question Paper
                  </span>
                  <span className="font-mono text-[#64748B] text-[11px]">
                    Uploaded: {viewFileModal.uploaded_date}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#1E293B]">{viewFileModal.title}</h4>
                <p className="text-[#64748B] leading-relaxed">{viewFileModal.description}</p>
              </div>

              {/* Document Container */}
              <div className="p-6 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 text-center space-y-3">
                <Paperclip className="w-10 h-10 text-[#2563EB] mx-auto animate-bounce" />
                <div>
                  <h5 className="text-sm font-extrabold text-[#1E293B] font-mono truncate max-w-xs mx-auto">
                    {viewFileModal.file_path ? viewFileModal.file_path.split("/").pop() : "past_paper.pdf"}
                  </h5>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Official End-Semester Examination Question Paper
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Download}
                    onClick={() => alert(`Downloading Question Paper: ${viewFileModal.file_path}...`)}
                    className="text-xs"
                  >
                    Download Question Paper PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => alert(`Opening ${viewFileModal.file_path} in document viewer...`)}
                    className="text-xs"
                  >
                    Open Full Document Viewer
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

export default StudentOldQuestionPaper;
