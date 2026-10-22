import React, { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Edit, Paperclip, Download, Eye, X, BookOpen, CheckCircle2, CalendarRange } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";
import { getDisplayFileName, downloadFile, openFileInNewTab, readFileAsDataURL, parseMultipleFiles, serializeMultipleFiles } from "../../utils/fileViewer";
import { useBatch } from "../../context/BatchContext";

const TeacherStudyMaterial = () => {
  const { selectedBatch, batches } = useBatch();
  const activeBatch = selectedBatch || batches.find((b) => b.is_active === true || b.isActive === true) || batches[0];
  const activeBatchId = activeBatch ? String(activeBatch.batch_id || activeBatch.batchId || activeBatch.id) : null;

  const [resources, setResources] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Study Material");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleViewDocument = (fileUrl, title = "Document Preview") => {
    openFileInNewTab(fileUrl, title);
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const userStr = localStorage.getItem("educonnect_user");
        const loggedUser = userStr ? JSON.parse(userStr) : null;
        const identifier = loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;

        const [materialsData, subjectsData] = await Promise.all([
          teacherApi.getStudyMaterials(),
          teacherApi.getAssignedSubjects(identifier),
        ]);

        if (Array.isArray(materialsData)) {
          setResources(materialsData);
        }
        if (Array.isArray(subjectsData)) {
          setAssignedSubjects(subjectsData);
        }
      } catch (err) {
        console.error("Teacher study materials load error:", err);
      }
    };
    fetchMaterials();
  }, []);

  // Filter subjects by active batch
  const batchSubjects = assignedSubjects.filter((s) => {
    if (!activeBatchId) return true;
    const subBatchId = String(s.batch_id || s.batchId || "");
    return subBatchId === activeBatchId;
  });

  // Filter study materials by active batch
  const batchResources = resources.filter((item) => {
    if (!activeBatchId) return true;
    if (item.batch_id && String(item.batch_id) === activeBatchId) return true;
    const itemSubId = item.subjectId || item.subject_id;
    if (itemSubId) {
      return batchSubjects.some((s) => String(s.subject_id || s.id) === String(itemSubId));
    }
    return false;
  });

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      try {
        const loadedFiles = await Promise.all(
          selected.map(async (file) => {
            const dataUrl = await readFileAsDataURL(file);
            return {
              name: file.name,
              path: dataUrl,
              size: file.size,
              type: file.type,
            };
          })
        );
        setAttachedFiles((prev) => [...prev, ...loadedFiles]);
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
    e.target.value = "";
  };

  const handleRemoveFile = (indexToRemove) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOpenAddModal = () => {
    setEditingResourceId(null);
    setTitle("");
    setDesc("");
    setType("Study Material");
    const defaultSub = batchSubjects[0]?.subject_id || batchSubjects[0]?.subjectId || "";
    setSelectedSubjectId(defaultSub);
    setAttachedFiles([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    const id = item.resourceId || item.resource_id;
    setEditingResourceId(id);
    setTitle(item.title || "");
    setDesc(item.description || "");
    setType(item.resourceType || item.resource_type || "Study Material");
    setSelectedSubjectId(item.subjectId || item.subject_id || "");
    const existingFiles = parseMultipleFiles(
      item.filePath || item.file_path,
      item.fileName || item.file_name,
      item.title
    );
    setAttachedFiles(existingFiles);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { attachment: serializedAttachment, fileName: serializedFileNames } = serializeMultipleFiles(attachedFiles);

    try {
      const payload = {
        title,
        description: desc,
        resource_type: type,
        resourceType: type,
        subject_id: selectedSubjectId,
        subjectId: selectedSubjectId,
        file_name: serializedFileNames || "study_material_doc.pdf",
        fileName: serializedFileNames || "study_material_doc.pdf",
        file_path: serializedAttachment || "/resources/study_material_doc.pdf",
        filePath: serializedAttachment || "/resources/study_material_doc.pdf",
      };

      if (editingResourceId) {
        await teacherApi.updateStudyMaterial(editingResourceId, payload);
        const data = await teacherApi.getStudyMaterials();
        if (Array.isArray(data) && data.length > 0) {
          setResources(data);
        }
        notifySuccess(`Study material '${title}' updated successfully!`);
      } else {
        await teacherApi.uploadStudyMaterial(payload);
        const data = await teacherApi.getStudyMaterials();
        if (Array.isArray(data) && data.length > 0) {
          setResources(data);
        }
        notifySuccess(`Study material '${title}' uploaded successfully!`);
      }

      setShowModal(false);
      setEditingResourceId(null);
    } catch (err) {
      console.error("Save material error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save study material.";
      notifyError(`Failed to save study material: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    const item = resources.find((r) => (r.resourceId || r.resource_id) === id);
    const itemTitle = item ? item.title : "study material";
    if (window.confirm(`Are you sure you want to delete '${itemTitle}'?`)) {
      try {
        await teacherApi.deleteStudyMaterial(id);
        setResources(resources.filter((r) => (r.resourceId || r.resource_id) !== id));
        notifySuccess(`Study material '${itemTitle}' deleted successfully!`);
      } catch (err) {
        console.error("Delete material error:", err);
        const msg = err.response?.data?.error || err.message || "Failed to delete study material.";
        notifyError(`Failed to delete study material: ${msg}`);
      }
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
        {batchResources.map((item) => {
          const resId = item.resourceId || item.resource_id;
          const fn = item.fileName || item.file_name;
          const fp = item.filePath || item.file_path;
          const fileName = getDisplayFileName(fn, fp, item.title);
          const fileUrl = fp || "/resources/study_material_doc.pdf";
          const resType = item.resourceType || item.resource_type || "Study Material";
          const uploadedDate = item.uploadedDate || item.uploaded_date || (item.createdAt ? String(item.createdAt).split("T")[0] : new Date().toISOString().split("T")[0]);
          const subjBadge = item.subject_code || item.subjectCode || item.subject_name || item.subjectName;

          return (
            <div
              key={resId}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header Badge & Date */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[11px] border border-[#14B8A6]/20">
                      {resType}
                    </span>
                    {subjBadge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[11px] border border-[#2563EB]/20">
                        {subjBadge}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[#64748B] text-[11px] font-semibold">{uploadedDate}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3
                    onClick={() => handleViewDocument(fileUrl, item.title)}
                    className="text-base font-extrabold text-[#1E293B] hover:text-[#2563EB] leading-snug cursor-pointer transition-colors"
                    title="Click title or file name to view file"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 mt-1.5">{item.description}</p>
                </div>

                {/* File Attachment Pills */}
                {(() => {
                  const mFiles = parseMultipleFiles(fileUrl, item.fileName || item.file_name, item.title);
                  if (mFiles.length === 0) return null;
                  return (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                        Attached Files ({mFiles.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mFiles.map((f, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleViewDocument(f.path, f.name)}
                            className="inline-flex items-center gap-1 font-mono font-semibold text-[10px] text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-2.5 py-0.5 rounded-md border border-[#2563EB]/20 transition-all cursor-pointer truncate max-w-full"
                            title={`Click to view ${f.name}`}
                          >
                            <Paperclip className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[150px]">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
                  onClick={() => handleDelete(resId)}
                  className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Delete Resource"
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
                {editingResourceId ? "Edit Study Material Details" : "Upload Study Material"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
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
                  placeholder="e.g. Unit 3 Microservices Architecture Notes"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Subject ({activeBatch?.batch_name || "Active Batch"})</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  <option value="">Select Allocated Subject</option>
                  {batchSubjects.map((sub) => {
                    const sId = sub.subject_id || sub.subjectId;
                    const sCode = sub.subject_code || sub.subjectCode;
                    const sName = sub.subject_name || sub.subjectName;
                    return (
                      <option key={sId} value={sId}>
                        {sCode ? `${sCode} - ` : ""}{sName}
                      </option>
                    );
                  })}
                </select>
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
                  placeholder="Provide resource summary and topics covered..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              {/* Multi-File Document Attachment Upload */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[#1E293B] font-bold flex items-center gap-1.5 text-xs">
                    <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Select Document Files
                  </label>
                  <span className="text-[10px] text-[#64748B] font-medium">Multiple files allowed</span>
                </div>

                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/10 file:text-[#2563EB] cursor-pointer"
                />

                {attachedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase">
                      <span>Attached Files ({attachedFiles.length})</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles([])}
                        className="text-[#EF4444] hover:underline cursor-pointer lowercase text-[10px]"
                      >
                        clear all
                      </button>
                    </div>

                    <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                      {attachedFiles.map((file, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E8F0] text-xs shadow-2xs hover:border-[#2563EB]/30 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                            <span className="font-mono text-[11px] text-[#1E293B] font-semibold truncate" title={file.name}>
                              {file.name}
                            </span>
                            {file.size && (
                              <span className="text-[10px] text-[#94A3B8] shrink-0 font-mono">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {file.path && (
                              <button
                                type="button"
                                onClick={() => handleViewDocument(file.path, file.name)}
                                className="p-1 text-[#2563EB] hover:bg-[#2563EB]/10 rounded cursor-pointer transition-colors"
                                title="Preview File"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(fIdx)}
                              className="p-1 text-[#EF4444] hover:bg-[#EF4444]/10 rounded cursor-pointer transition-colors"
                              title="Remove File"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Teacher Uploaded File Viewer Modal */}
      {viewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  Uploaded Resource Document
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

            {/* Document Meta Box */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[10px]">
                    {viewFileModal.resource_type}
                  </span>
                  <span className="font-mono text-[#64748B] text-[11px]">
                    Uploaded: {viewFileModal.uploaded_date}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#1E293B]">{viewFileModal.title}</h4>
                <p className="text-[#64748B] leading-relaxed">{viewFileModal.description}</p>
              </div>

              {/* Document File Container */}
              <div className="p-6 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/20 text-center space-y-3">
                <Paperclip className="w-10 h-10 text-[#2563EB] mx-auto animate-bounce" />
                <div>
                  <h5 className="text-sm font-extrabold text-[#1E293B] font-mono truncate max-w-xs mx-auto">
                    {viewFileModal.file_path ? viewFileModal.file_path.split("/").pop() : "document.pdf"}
                  </h5>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Official Department Resource Document
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Download}
                    onClick={() => downloadFile(viewFileModal.file_path, viewFileModal.title)}
                    className="text-xs"
                  >
                    Download Resource File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewDocument(viewFileModal.file_path, viewFileModal.title)}
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

export default TeacherStudyMaterial;

