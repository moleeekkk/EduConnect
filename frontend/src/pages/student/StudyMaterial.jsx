import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, Paperclip, X, BookOpen } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";
import { getDisplayFileName, downloadFile, openFileInNewTab } from "../../utils/fileViewer";

const CATEGORIES = ["All", "Study Material", "Question Paper", "E-Book", "PPT"];

const StudentStudyMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewFileModal, setViewFileModal] = useState(null);

  const handleViewDocument = (fileUrl, title = "Document Preview") => {
    openFileInNewTab(fileUrl, title);
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await studentApi.getStudyMaterials();
        if (Array.isArray(data)) {
          setMaterials(data);
        }
      } catch (err) {
        console.error("Study materials load error:", err);
      }
    };
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter((item) => {
    if (activeCategory === "All") return true;
    return (item.resource_type || "").toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Learning Resources & Study Material</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Access course materials, question papers, e-books and slides published for your cohort.</p>
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

      {/* Cards Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((item) => {
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
                  <div className="pt-1">
                    <button
                      onClick={() => handleViewDocument(item.file_path, item.title)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB] hover:text-white px-3 py-1 rounded-lg border border-[#2563EB]/20 font-bold cursor-pointer transition-all truncate max-w-full"
                      title="Click file name to open document in a new tab"
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0" /> {fileName}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B] font-medium">Department Resource</span>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => downloadFile(downloadUrl, fileName)}
                    className="text-xs"
                  >
                    Download File
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-[#64748B] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#1E293B]">No {activeCategory} Resources Published</h3>
          <p className="text-xs text-[#64748B]">There are currently no learning resources published for your cohort in this category.</p>
        </div>
      )}
    </div>
  );
};

export default StudentStudyMaterial;
