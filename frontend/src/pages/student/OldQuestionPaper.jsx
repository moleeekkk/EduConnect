import React from "react";
import { FileQuestion, Download, Calendar } from "lucide-react";
import Button from "../../components/common/Button";
import { mockLearningResources } from "../../data/mockData";

const StudentOldQuestionPaper = () => {
  const papers = mockLearningResources.filter((r) => r.resource_type === "Question Paper");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Old Question Papers Archive (learning_resources)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Download previous semester question papers and sample test keys</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.map((item) => (
          <div key={item.resource_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-[10px]">
                  Question Paper
                </span>
                <span className="font-mono text-[#64748B]">Uploaded: {item.uploaded_date}</span>
              </div>

              <h3 className="text-sm font-bold text-[#1E293B]">{item.title}</h3>
              <p className="text-[#64748B]">{item.description}</p>
            </div>

            <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#64748B]">{item.file_path}</span>
              <Button
                variant="accent"
                size="sm"
                icon={Download}
                onClick={() => alert(`Downloading Question Paper: ${item.file_path}`)}
                className="text-xs"
              >
                Download PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentOldQuestionPaper;
