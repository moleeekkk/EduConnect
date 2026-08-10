import React, { useState } from "react";
import { FileQuestion, Plus, Trash2, Edit, Paperclip } from "lucide-react";
import Button from "../../components/common/Button";
import { mockLearningResources } from "../../data/mockData";

const TeacherOldQuestionPaper = () => {
  const [papers, setPapers] = useState(
    mockLearningResources.filter((r) => r.resource_type === "Question Paper")
  );

  const [showModal, setShowModal] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState(null);

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
      // Edit Question Paper
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
      // Create Question Paper
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Manage Old Question Papers (learning_resources)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Upload, Edit, View, and Delete past examination papers and solution keys</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Add Question Paper
        </Button>
      </div>

      {/* Question Papers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.map((item) => (
          <div key={item.resource_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[10px]">
                  Question Paper
                </span>
                <span className="font-mono text-[#64748B] text-[11px]">Uploaded: {item.uploaded_date}</span>
              </div>

              <h3 className="text-sm font-bold text-[#1E293B]">{item.title}</h3>
              <p className="text-[#64748B]">{item.description}</p>
            </div>

            <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded truncate max-w-[150px] flex items-center gap-1 font-bold">
                <Paperclip className="w-3 h-3 shrink-0" /> {item.file_path.split("/").pop()}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => handleOpenEditModal(item)}
                  className="text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(item.resource_id)}
                  className="text-xs !bg-[#EF4444]/10 !text-[#EF4444] hover:!bg-[#EF4444] hover:!text-white border-transparent"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editingPaperId ? "Edit Question Paper Details" : "Add Old Question Paper"}
            </h3>

            <form onSubmit={handleSavePaper} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Paper Title (title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2025 Summer End Semester Exam Paper"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Description (description)</label>
                <textarea
                  rows={2}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide exam session details or answer key summary..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              {/* File Selector */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                <label className="block text-[#1E293B] font-bold flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Select Question Paper File (file_path)
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
    </div>
  );
};

export default TeacherOldQuestionPaper;
