import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import Button from "../../components/common/Button";
import { mockQuizzes, mockMcqs, mockSubjects } from "../../data/mockData";

const StudentQuizPractice = () => {
  const [selectedLearnerType, setSelectedLearnerType] = useState("Fast");
  const [selectedSubjectId, setSelectedSubjectId] = useState("subj-101");
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState(false);

  const matchingQuizzes = (mockQuizzes || []).filter(
    (q) => q.learner_type === selectedLearnerType && q.subject_id === selectedSubjectId
  );

  const activeQuiz = matchingQuizzes[0] || (mockQuizzes || []).find((q) => q.learner_type === selectedLearnerType);
  const quizMcqs = (mockMcqs || []).filter((m) => m.quiz_id === activeQuiz?.quiz_id);

  const handleSelectOption = (mcqId, option) => {
    if (showExplanations) return;
    setUserAnswers({ ...userAnswers, [mcqId]: option });
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowExplanations(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Interactive Quiz Practice</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-[#64748B]">Category:</label>
            <div className="inline-flex rounded-lg border border-[#E2E8F0] p-1 bg-[#F8FAFC]">
              <button
                onClick={() => {
                  setSelectedLearnerType("Fast");
                  resetQuiz();
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedLearnerType === "Fast" ? "bg-[#2563EB] text-white" : "text-[#64748B]"}`}
              >
                Fast Learner
              </button>
              <button
                onClick={() => {
                  setSelectedLearnerType("Slow");
                  resetQuiz();
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedLearnerType === "Slow" ? "bg-[#14B8A6] text-white" : "text-[#64748B]"}`}
              >
                Slow Learner
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-[#64748B]">Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                resetQuiz();
              }}
              className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
            >
              {mockSubjects && mockSubjects.length > 0 ? (
                mockSubjects.map((subj) => (
                  <option key={subj.subject_id} value={subj.subject_id}>
                    {subj.subject_name} ({subj.subject_code})
                  </option>
                ))
              ) : (
                <option value="">No Subjects</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {activeQuiz ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] mt-1">{activeQuiz.title}</h2>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetQuiz} icon={RefreshCw} className="text-xs">
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {quizMcqs.length > 0 ? (
              quizMcqs.map((mcq, index) => {
                const selected = userAnswers[mcq.mcq_id];
                return (
                  <div key={mcq.mcq_id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 text-xs">
                    <h3 className="font-bold text-[#1E293B]">
                      {index + 1}. {mcq.question}
                    </h3>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-[#F8FAFC] rounded-lg text-center text-xs text-[#64748B]">
                No quiz questions added for this subject yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
          No quiz practice tests available.
        </div>
      )}
    </div>
  );
};

export default StudentQuizPractice;
