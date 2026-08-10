import React from "react";
import { BookOpen, Award, CheckCircle } from "lucide-react";
import { mockSubjects } from "../../data/mockData";

const StudentSyllabus = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h1 className="text-xl font-bold text-[#1E293B]">Course Syllabus (subjects)</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Semester 3 Curriculum Breakdown & Unit Modules</p>
      </div>

      <div className="space-y-4">
        {mockSubjects.map((subject) => (
          <div key={subject.subject_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold">
                  {subject.subject_code}
                </span>
                <h2 className="text-base font-bold text-[#1E293B] mt-1">{subject.subject_name}</h2>
              </div>
              <span className="px-3 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-lg text-xs font-bold self-start sm:self-auto">
                {subject.credits} Semester Credits
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <h4 className="font-bold text-[#1E293B] mb-1">Module 1: Core Fundamentals</h4>
                <p className="text-[11px] text-[#64748B]">Architecture, syntax structure, environment setup & design principles.</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <h4 className="font-bold text-[#1E293B] mb-1">Module 2: Advanced Design Patterns</h4>
                <p className="text-[11px] text-[#64748B]">State management, middleware pipelines, API integrations & async flows.</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <h4 className="font-bold text-[#1E293B] mb-1">Module 3: Deployment & Practical Lab</h4>
                <p className="text-[11px] text-[#64748B]">Performance tuning, security standards, CI/CD automated deployment.</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSyllabus;
