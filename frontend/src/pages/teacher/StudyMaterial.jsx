import React, { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Edit, Paperclip, Download, Eye, X, BookOpen, Filter, FileCode } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";
import { getDisplayFileName, downloadFile, openFileInNewTab } from "../../utils/fileViewer";

const CATEGORIES = ["All", "Study Material", "Question Paper", "E-Book", "PPT"];

const TeacherStudyMaterial = () => {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);

  // Syllabus Modal State
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [syllabiList, setSyllabiList] = useState([]);
  const [selectedSyllabusSubjectId, setSelectedSyllabusSubjectId] = useState("");
  const [syllabusUnits, setSyllabusUnits] = useState([
    { unit_number: 1, title: "", topics: "", description: "" }
  ]);
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [syllabusFileName, setSyllabusFileName] = useState("");
  const [savingSyllabus, setSavingSyllabus] = useState(false);

  const fetchMaterials = async () => {
    try {
      const [data, subjData] = await Promise.all([
        teacherApi.getStudyMaterials(),
        teacherApi.getAssignedSubjects(),
      ]);
      if (Array.isArray(data)) {
        setResources(data);
      }
      if (Array.isArray(subjData)) {
        setSubjects(subjData);
      }
    } catch (err) {
      console.error("Teacher study materials load error:", err);
    }
  };

  const fetchTeacherSyllabi = async () => {
    try {
      const data = await teacherApi.getSyllabus();
      if (Array.isArray(data)) {
        setSyllabiList(data);
      }
    } catch (err) {
      console.error("Fetch syllabus error:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleOpenSyllabusModal = async () => {
    await fetchTeacherSyllabi();
    if (subjects.length > 0) {
      const firstSubjId = subjects[0].subject_id || subjects[0].id;
      setSelectedSyllabusSubjectId(firstSubjId);
      loadSyllabusForSubject(firstSubjId, syllabiList);
    }
    setShowSyllabusModal(true);
  };

  const loadSyllabusForSubject = (subjId, currentSyllabi = syllabiList) => {
    const existing = currentSyllabi.find(s => (s.subject_id || s.id) === subjId);
    if (existing && Array.isArray(existing.units) && existing.units.length > 0) {
      setSyllabusUnits(existing.units.map(u => ({
        unit_number: u.unit_number || 1,
        title: u.title || "",
        topics: u.topics || "",
        description: u.description || ""
      })));
    } else {
      setSyllabusUnits([
        { unit_number: 1, title: "Module 1: Fundamentals", topics: "", description: "" },
        { unit_number: 2, title: "Module 2: Advanced Topics", topics: "", description: "" }
      ]);
    }
    setSyllabusFile(null);
    setSyllabusFileName("");
  };

  const handleSyllabusSubjectChange = (subjId) => {
    setSelectedSyllabusSubjectId(subjId);
    loadSyllabusForSubject(subjId);
  };

  const handleAddUnit = () => {
    setSyllabusUnits(prev => [
      ...prev,
      { unit_number: prev.length + 1, title: "", topics: "", description: "" }
    ]);
  };

  const handleRemoveUnit = (index) => {
    if (syllabusUnits.length <= 1) return;
    setSyllabusUnits(prev => prev.filter((_, idx) => idx !== index).map((u, idx) => ({ ...u, unit_number: idx + 1 })));
  };

  const handleUnitChange = (index, field, value) => {
    setSyllabusUnits(prev => prev.map((u, idx) => idx === index ? { ...u, [field]: value } : u));
  };

  const handleSaveSyllabus = async (e) => {
    e.preventDefault();
    if (!selectedSyllabusSubjectId) {
      notifyError("Please select a subject.");
      return;
    }

    try {
      setSavingSyllabus(true);
      const formData = new FormData();
      formData.append("unitsJson", JSON.stringify(syllabusUnits));
      if (syllabusFile) {
        formData.append("file", syllabusFile);
      }

      await teacherApi.saveSyllabus(selectedSyllabusSubjectId, formData);
      notifySuccess("Course syllabus saved and published successfully!");
      await fetchTeacherSyllabi();
      setShowSyllabusModal(false);
    } catch (err) {
      console.error("Save syllabus error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save syllabus.";
      notifyError(`Failed to save syllabus: ${msg}`);
    } finally {
      setSavingSyllabus(false);
    }
  };

  const handleViewDocument = (fileUrl, title = "Document Preview") => {
    openFileInNewTab(fileUrl, title);
  };

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Study Material");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        notifyError("File size exceeds 25MB limit!");
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleOpenAddModal = () => {
    setEditingResourceId(null);
    setTitle("");
    setDesc("");
    setType("Study Material");
    setSelectedSubjectId(subjects.length > 0 ? (subjects[0].subject_id || subjects[0].id) : "");
    setSelectedFile(null);
    setSelectedFileName("");
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    const resId = item.material_id || item.resource_id;
    setEditingResourceId(resId);
    setTitle(item.title || "");
    setDesc(item.description || "");
    setType(item.resource_type || "Study Material");
    setSelectedSubjectId(item.subject_id || (subjects.length > 0 ? (subjects[0].subject_id || subjects[0].id) : ""));
    setSelectedFile(null);
    setSelectedFileName(item.file_name || (item.file_path ? item.file_path.split("/").pop() : ""));
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingResourceId && !selectedFile) {
      notifyError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("resource_type", type);
    if (selectedSubjectId) {
      formData.append("subject_id", selectedSubjectId);
    }
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      if (editingResourceId) {
        await teacherApi.updateStudyMaterial(editingResourceId, formData);
        notifySuccess(`Study material '${title}' updated in database successfully!`);
      } else {
        await teacherApi.uploadStudyMaterial(formData);
        notifySuccess(`Study material '${title}' uploaded to database successfully!`);
      }

      await fetchMaterials();
      setShowModal(false);
      setEditingResourceId(null);
    } catch (err) {
      console.error("Save material error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save study material.";
      notifyError(`Failed to save study material: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    const item = resources.find((r) => (r.material_id || r.resource_id) === id);
    const itemTitle = item ? item.title : "study material";
    if (window.confirm(`Are you sure you want to delete '${itemTitle}' from database?`)) {
      try {
        await teacherApi.deleteStudyMaterial(id);
        setResources((prev) => prev.filter((r) => (r.material_id || r.resource_id) !== id));
        notifySuccess(`Study material '${itemTitle}' deleted successfully!`);
      } catch (err) {
        console.error("Delete material error:", err);
        const msg = err.response?.data?.message || err.message || "Failed to delete study material.";
        notifyError(`Failed to delete study material: ${msg}`);
      }
    }
  };

  const filteredResources = resources.filter((item) => {
    if (activeCategory === "All") return true;
    return (item.resource_type || "").toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Learning Resources & Course Syllabus</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Upload Study Materials, Question Papers, E-Books and author Course Syllabi.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={BookOpen} onClick={handleOpenSyllabusModal} className="text-xs">
            Manage Syllabus
          </Button>
          <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
            Upload Material
          </Button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat
                ? "bg-[#2563EB] text-white shadow-xs"
                : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((item) => {
            const resId = item.material_id || item.resource_id;
            const fileName = getDisplayFileName(item.file_name, item.file_path, item.title);
            const downloadUrl = `${item.file_path}/download`;

            return (
              <div
                key={resId}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Header Badge & Date */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[11px] border border-[#14B8A6]/20">
                      {item.resource_type || "Study Material"}
                    </span>
                    <span className="font-mono text-[#64748B] text-[11px] font-semibold">{item.uploaded_date}</span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#1E293B] leading-snug">{item.title}</h3>
                    {item.subject_name && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-[#1E293B] text-[10px] font-bold">
                        {item.subject_code ? `${item.subject_code} - ${item.subject_name}` : item.subject_name}
                      </span>
                    )}
                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 mt-1.5">{item.description}</p>
                  </div>

                  {/* File Attachment Pill */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleViewDocument(item.file_path, item.title)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-3 py-1 rounded-lg border border-[#2563EB]/20 font-bold cursor-pointer transition-all truncate max-w-[200px]"
                      title="Click to preview file"
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0" /> {fileName}
                    </button>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => downloadFile(downloadUrl, fileName)}
                    className="text-[11px] px-2.5 py-1"
                  >
                    Download
                  </Button>

                  <div className="flex items-center gap-1.5">
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-[#64748B] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#1E293B]">No {activeCategory} Resources Found</h3>
          <p className="text-xs text-[#64748B]">Click "Upload Material" above to upload learning resources for your active class allocations.</p>
        </div>
      )}

      {/* Add / Edit Material Modal */}
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
                <label className="block text-[#64748B] mb-1 font-medium">Subject Allocation</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-medium"
                >
                  <option value="">-- Select Subject Allocation --</option>
                  {subjects.map((s) => (
                    <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                      {s.subject_code ? `${s.subject_code} - ${s.subject_name}` : s.subject_name}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block text-[#64748B] mb-1 font-medium">Resource Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-medium"
                >
                  <option value="Study Material">Study Material</option>
                  <option value="Question Paper">Question Paper</option>
                  <option value="E-Book">E-Book</option>
                  <option value="PPT">PPT / Slides</option>
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

              {/* Document File Attachment */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                <label className="block text-[#1E293B] font-bold flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Select Document File (PDF, DOCX, PPTX, etc.)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/10 file:text-[#2563EB] cursor-pointer"
                />
                {selectedFileName && (
                  <p className="text-[11px] text-[#14B8A6] font-semibold font-mono truncate">
                    Selected: {selectedFileName}
                  </p>
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

      {/* Author Syllabus Modal */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Author & Publish Subject Syllabus</h3>
                <p className="text-[11px] text-[#64748B]">Define unit modules and attach optional official syllabus PDF</p>
              </div>
              <button
                onClick={() => setShowSyllabusModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSyllabus} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1 custom-scrollbar">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Select Subject</label>
                <select
                  value={selectedSyllabusSubjectId}
                  onChange={(e) => handleSyllabusSubjectChange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                      {s.subject_code ? `${s.subject_code} - ${s.subject_name}` : s.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Units List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[#1E293B] font-bold">Curriculum Units / Modules</label>
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Unit
                  </button>
                </div>

                {syllabusUnits.map((unit, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#2563EB] text-[11px]">Unit {idx + 1}</span>
                      {syllabusUnits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveUnit(idx)}
                          className="text-red-500 hover:text-red-700 text-[11px] font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Unit Title (e.g. Data Structures)"
                        value={unit.title}
                        onChange={(e) => handleUnitChange(idx, "title", e.target.value)}
                        className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Topics Covered (comma separated)"
                        value={unit.topics}
                        onChange={(e) => handleUnitChange(idx, "topics", e.target.value)}
                        className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Unit Description / Objectives..."
                      value={unit.description}
                      onChange={(e) => handleUnitChange(idx, "description", e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Optional PDF File */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <label className="block text-[#1E293B] font-bold flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Attach Official Syllabus PDF (Optional)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSyllabusFile(file);
                      setSyllabusFileName(file.name);
                    }
                  }}
                  className="w-full text-xs text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB]/10 file:text-[#2563EB] cursor-pointer"
                />
                {syllabusFileName && (
                  <p className="text-[11px] text-[#14B8A6] font-semibold font-mono truncate">
                    Attached: {syllabusFileName}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0] shrink-0">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowSyllabusModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" disabled={savingSyllabus}>
                  {savingSyllabus ? "Saving..." : "Publish Syllabus"}
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
