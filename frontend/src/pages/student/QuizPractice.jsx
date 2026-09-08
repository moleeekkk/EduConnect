import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle, XCircle, Sparkles, RefreshCw, BookOpen } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentQuizPractice = () => {
  const [selectedLearnerType, setSelectedLearnerType] = useState("Fast");
  const [selectedSubjectId, setSelectedSubjectId] = useState("subj-101");
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState(false);

  const [quizzes, setQuizzes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizData, syllabusData] = await Promise.all([
          studentApi.getQuizzes(),
          studentApi.getSyllabus(),
        ]);
        if (Array.isArray(quizData)) {
          setQuizzes(quizData);
        }
        if (Array.isArray(syllabusData)) {
          setSubjects(syllabusData);
        }
      } catch (err) {
        console.error("Quiz load error:", err);
      }
    };
    fetchData();
  }, []);

  const matchingQuizzes = quizzes.filter(
    (q) => q.learner_type === selectedLearnerType && (q.subject_id === selectedSubjectId || !q.subject_id)
  );

  const activeQuiz = matchingQuizzes[0] || quizzes.find((q) => q.learner_type === selectedLearnerType) || quizzes[0];
  const quizMcqs = mcqs.filter((m) => m.quiz_id === activeQuiz?.quiz_id) || activeQuiz?.mcqs || [];

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
      {/* Header with Learner Category & Subject Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Interactive Quiz Practice</h1>
        </div>

        {/* Selection Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Learner Category Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-[#64748B]">Category:</label>
            <div className="inline-flex rounded-lg border border-[#E2E8F0] p-1 bg-[#F8FAFC]">
              <button
                onClick={() => {
                  setSelectedLearnerType("Fast");
                  resetQuiz();
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedLearnerType === "Fast" ? "bg-[#2563EB] text-white" : "text-[#64748B]"
                  }`}
              >
                Fast Learner
              </button>
              <button
                onClick={() => {
                  setSelectedLearnerType("Slow");
                  resetQuiz();
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedLearnerType === "Slow" ? "bg-[#14B8A6] text-white" : "text-[#64748B]"
                  }`}
              >
                Slow Learner
              </button>
            </div>
          </div>

          {/* Subject Selector */}
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
              {subjects.map((subj) => (
                <option key={subj.subject_id || subj.id || subj.code} value={subj.subject_id || subj.id}>
                  {subj.subject_name || subj.name} ({subj.subject_code || subj.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Quiz Card */}
      {activeQuiz ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${activeQuiz.learner_type === "Fast"
                    ? "bg-[#2563EB]/10 text-[#2563EB]"
                    : "bg-[#14B8A6]/10 text-[#14B8A6]"
                    }`}
                >
                  {activeQuiz.learner_type} Learner Category
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-bold">
                  {subjects.find((s) => s.subject_id === selectedSubjectId || s.id === selectedSubjectId)?.subject_code || "MCQ"}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1E293B] mt-1">{activeQuiz.title}</h2>
              <p className="text-xs text-[#64748B]">{activeQuiz.description}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetQuiz} icon={RefreshCw} className="text-xs">
                Reset
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => setShowExplanations(true)}
                disabled={showExplanations}
                className="text-xs"
              >
                Check Answers & Explanations
              </Button>
            </div>
          </div>

          {/* MCQs List */}
          <div className="space-y-4">
            {quizMcqs.length > 0 ? (
              quizMcqs.map((mcq, index) => {
                const selected = userAnswers[mcq.mcq_id];
                const isCorrect = selected === mcq.correct_answer;
                return (
                  <div key={mcq.mcq_id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#1E293B]">
                        {index + 1}. {mcq.question}
                      </h3>
                      {showExplanations && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isCorrect ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EF4444]/10 text-[#EF4444]"
                            }`}
                        >
                          {isCorrect ? "Correct" : `Correct Option: ${mcq.correct_answer}`}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: "A", val: mcq.option_a },
                        { key: "B", val: mcq.option_b },
                        { key: "C", val: mcq.option_c },
                        { key: "D", val: mcq.option_d },
                      ].map((opt) => {
                        let btnStyle = "bg-white border-[#E2E8F0] text-[#1E293B]";
                        if (selected === opt.key) {
                          btnStyle = "bg-[#2563EB]/10 border-[#2563EB] font-bold text-[#2563EB]";
                        }
                        if (showExplanations && opt.key === mcq.correct_answer) {
                          btnStyle = "bg-[#22C55E]/10 border-[#22C55E] font-bold text-[#22C55E]";
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption(mcq.mcq_id, opt.key)}
                            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                              {opt.key}
                            </span>
                            <span>{opt.val}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showExplanations && (
                      <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] text-[11px] space-y-1">
                        <span className="font-bold text-[#2563EB]">Explanation:</span>
                        <p className="text-[#64748B]">{mcq.explanation}</p>
                      </div>
                    )}
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
          Please select a subject to load practice quizzes.
        </div>
      )}
    </div>
  );
};

export default StudentQuizPractice;
