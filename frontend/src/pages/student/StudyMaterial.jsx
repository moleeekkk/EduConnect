import React from "react";
import { FileText, Download, BookOpen, ExternalLink } from "lucide-react";
import Button from "../../components/common/Button";
import { mockLearningResources, mockSubjects } from "../../data/mockData";

const StudentStudyMaterial = () => {
  const materials = mockLearningResources.filter((r) => r.resource_type !== "Question Paper");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Study Material & Course Resources (learning_resources)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Access faculty notes, e-books, and presentation slides</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((item) => (
          <div key={item.resource_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[10px]">
                  {item.resource_type}
                </span>
                <span className="font-mono text-[#64748B]">{item.uploaded_date}</span>
              </div>

              <h3 className="text-sm font-bold text-[#1E293B]">{item.title}</h3>
              <p className="text-[#64748B] line-clamp-3">{item.description}</p>
            </div>

            <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#64748B] truncate max-w-[150px]">{item.file_path}</span>
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => alert(`Downloading: ${item.file_path}`)}
                className="text-xs"
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentStudyMaterial;
