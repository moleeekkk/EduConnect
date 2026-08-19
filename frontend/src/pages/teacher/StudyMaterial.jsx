import React, { useState } from "react";
import { Plus, Trash2, Edit, Paperclip, Download, Eye, X } from "lucide-react";
import Button from "../../components/common/Button";
import { mockLearningResources } from "../../data/mockData";

const TeacherStudyMaterial = () => {
  const [resources, setResources] = useState(
    (mockLearningResources || []).filter((r) => r.resource_type !== "Question Paper")
  );

  const [showModal, setShowModal] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Study Material");
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleOpenAddModal = () => {
    setEditingResourceId(null);
    setTitle("");
    setDesc("");
    setType("Study Material");
    setSelectedFileName("");
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingResourceId(item.resource_id);
    setTitle(item.title);
    setDesc(item.description);
    setType(item.resource_type || "Study Material");
    const extractedName = item.file_path ? item.file_path.split("/").pop() : "";
    setSelectedFileName(extractedName);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalFilePath = selectedFileName
      ? selectedFileName.startsWith("/")
        ? selectedFileName
        : `/resources/${selectedFileName}`
      : "/resources/study_material_doc.pdf";

    if (editingResourceId) {
      setResources(
        resources.map((r) =>
          r.resource_id === editingResourceId
            ? {
                ...r,
                title,
                description: desc,
                resource_type: type,
                file_path: finalFilePath,
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );
    } else {
      const created = {
        resource_id: `res-${Date.now()}`,
        title,
        description: desc,
        resource_type: type,
        file_path: finalFilePath,
        uploaded_date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setResources([created, ...resources]);
    }

    setShowModal(false);
    setEditingResourceId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this study material?")) {
      setResources(resources.filter((r) => r.resource_id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Study Material</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Upload Material
        </Button>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources && resources.length > 0 ? (
          resources.map((item) => {
            const fileName = item.file_path ? item.file_path.split("/").pop() : "document.pdf";
            return (
              <div
                key={item.resource_id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[11px] border border-[#14B8A6]/20">
                      {item.resource_type}
                    </span>
                    <span className="font-mono text-[#64748B] text-[11px] font-semibold">{item.uploaded_date}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#1E293B] leading-snug">{item.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 mt-1.5">{item.description}</p>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => setViewFileModal(item)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-3 py-1 rounded-lg border border-[#2563EB]/20 font-bold cursor-pointer transition-all truncate max-w-full"
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0" /> {fileName}
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg text-[#14B8A6] hover:bg-[#14B8A6]/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.resource_id)}
                    className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs col-span-full">
            No study materials uploaded yet.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editingResourceId ? "Edit Study Material Details" : "Upload Study Material"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Resource Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  <option value="Study Material">Study Material</option>
                  <option value="E-Book">E-Book</option>
                  <option value="PPT">PPT / Slides</option>
                  <option value="Reference Guide">Reference Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Summary..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  {editingResourceId ? "Save Changes" : "Upload Resource"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudyMaterial;
