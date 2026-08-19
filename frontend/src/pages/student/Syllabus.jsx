import React from "react";
import { mockSubjects } from "../../data/mockData";

const StudentSyllabus = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h1 className="text-xl font-bold text-[#1E293B]">Course Syllabus</h1>
      </div>

      <div className="space-y-4">
        {mockSubjects && mockSubjects.length > 0 ? (
          mockSubjects.map((subject) => (
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
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
            No course syllabus records available.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSyllabus;
