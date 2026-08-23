import React, { useState, useEffect } from "react";
import { FileQuestion, Plus, Trash2, Edit, Paperclip, Eye, Download, X, FileText } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";

const TeacherOldQuestionPaper = () => {
  const [papers, setPapers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const data = await teacherApi.getOldQuestionPapers();
        if (Array.isArray(data)) {
          setPapers(data);
        }
      } catch (err) {
        console.error("Teacher question papers load error:", err);
      }
    };
    fetchPapers();
  }, []);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPaperId(null);
    setTitle("");
    setDesc("");
    setSelectedFileName("");
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingPaperId(item.resource_id);
    setTitle(item.title);
    setDesc(item.description);
    const extractedName = item.file_path ? item.file_path.split("/").pop() : "";
    setSelectedFileName(extractedName);
    setShowModal(true);
  };

  const handleSavePaper = (e) => {
    e.preventDefault();
    const finalFilePath = selectedFileName
      ? selectedFileName.startsWith("/")
        ? selectedFileName
        : `/resources/${selectedFileName}`
      : "/resources/past_paper_question.pdf";

    if (editingPaperId) {
      setPapers(
        papers.map((p) =>
          p.resource_id === editingPaperId
            ? {
                ...p,
                title,
                description: desc,
                file_path: finalFilePath,
                updated_at: new Date().toISOString(),
              }
            : p
        )
      );
    } else {
      const created = {
        resource_id: `res-qp-${papers.length + 1}`,
        teacher_subject_id: "ts-001",
        title,
        description: desc,
        resource_type: "Question Paper",
        file_path: finalFilePath,
        uploaded_date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPapers([created, ...papers]);
    }

    setShowModal(false);
    setEditingPaperId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this question paper?")) {
      setPapers(papers.filter((p) => p.resource_id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Old Question Papers</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Add Question Paper
        </Button>
      </div>

      {/* Question Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((item) => {
          const fileName = item.file_path ? item.file_path.split("/").pop() : "past_exam_paper.pdf";
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

              {/* Card Footer Actions: Edit & Delete */}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 rounded-lg text-[#14B8A6] hover:bg-[#14B8A6]/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Edit Details"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.resource_id)}
                  className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Delete Question Paper"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editingPaperId ? "Edit Question Paper Details" : "Add Old Question Paper"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaper} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2025 Summer End Semester Examination Paper"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Description / Exam Session</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide exam session details or answer key summary..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              {/* File Attachment */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                <label className="block text-[#1E293B] font-bold flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Select Question Paper File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/10 file:text-[#2563EB] cursor-pointer"
                />
                {selectedFileName && (
                  <p className="text-[11px] text-[#14B8A6] font-semibold font-mono">
                    Selected File: {selectedFileName}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  {editingPaperId ? "Save Changes" : "Publish Question Paper"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Uploaded File Viewer Modal */}
      {viewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  Question Paper Document
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

            {/* Paper Meta Details */}
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
                    onClick={() => alert(`Opening ${viewFileModal.file_path} in document previewer...`)}
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

export default TeacherOldQuestionPaper;
