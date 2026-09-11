import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle, XCircle, Sparkles, RefreshCw, BookOpen, Award, CheckCircle2, History } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";
import { notifyError, notifySuccess } from "../../utils/toast";

const StudentQuizPractice = () => {
  const [selectedLearnerType, setSelectedLearnerType] = useState("Fast");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [attemptResult, setAttemptResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizData, syllabusData] = await Promise.all([
          studentApi.getQuizzes(),
          studentApi.getSyllabus(),
        ]);

        if (Array.isArray(syllabusData)) {
          setSubjects(syllabusData);
          if (syllabusData.length > 0) {
            setSelectedSubjectId(syllabusData[0].subject_id || syllabusData[0].id);
          }
        }

        if (Array.isArray(quizData)) {
          setQuizzes(quizData);
        }
      } catch (err) {
        console.error("Student quiz practice load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Quizzes by selected Learner Type & Subject
  const matchingQuizzes = quizzes.filter((q) => {
    const catMatch = !selectedLearnerType || (q.learner_type || "").toLowerCase() === selectedLearnerType.toLowerCase();
    const qSubId = q.subject_id || q.subjectId || "";
    
    const currentSubObj = subjects.find(s => String(s.subject_id || s.id) === String(selectedSubjectId));
    const subCode = currentSubObj?.subject_code || currentSubObj?.code || "";

    const subMatch =
      !selectedSubjectId ||
      !qSubId ||
      String(qSubId).toLowerCase() === String(selectedSubjectId).toLowerCase() ||
      (subCode && String(qSubId).toUpperCase() === subCode.toUpperCase());

    return catMatch && subMatch;
  });

  const availableQuizzes = matchingQuizzes.length > 0 ? matchingQuizzes : quizzes.filter(q => (q.learner_type || "").toLowerCase() === selectedLearnerType.toLowerCase());
  const activeQuiz = availableQuizzes.find(q => String(q.quiz_id || q.id) === String(selectedQuizId)) || availableQuizzes[0] || quizzes[0];
  const activeQuizId = activeQuiz?.quiz_id || activeQuiz?.id;

  // Auto-start or resume attempt when active quiz changes
  useEffect(() => {
    if (!activeQuizId) return;

    const initializeAttempt = async () => {
      try {
        const attemptResp = await studentApi.startQuizAttempt(activeQuizId);
        if (attemptResp && attemptResp.attempt_id) {
          setActiveAttemptId(attemptResp.attempt_id);
          if (attemptResp.user_answers) {
            setUserAnswers(attemptResp.user_answers);
          } else {
            setUserAnswers({});
          }
          if (attemptResp.status === "COMPLETED") {
            const detail = await studentApi.getStudentAttemptDetail(attemptResp.attempt_id);
            setAttemptResult(detail);
            setShowExplanations(true);
          } else {
            setAttemptResult(null);
            setShowExplanations(false);
          }
        }
      } catch (err) {
        console.error("Initialize attempt error:", err);
      }
    };

    initializeAttempt();
  }, [activeQuizId]);

  const handleSelectOption = async (mcqId, option) => {
    if (showExplanations) return;
    const nextAnswers = { ...userAnswers, [mcqId]: option };
    setUserAnswers(nextAnswers);

    if (activeQuizId && activeAttemptId) {
      try {
        await studentApi.saveQuizAttempt(activeQuizId, activeAttemptId, { answers: nextAnswers });
      } catch (err) {
        console.error("Save answer draft error:", err);
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizId || !activeAttemptId) return;

    try {
      setSubmitting(true);
      const result = await studentApi.submitQuizAttempt(activeQuizId, activeAttemptId, { answers: userAnswers });
      setAttemptResult(result);
      setShowExplanations(true);
      notifySuccess(`Quiz submitted! Your score: ${result.score} pts (${result.percentage}%)`);
    } catch (err) {
      console.error("Submit quiz error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to submit quiz.";
      notifyError(`Submission error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetOrTryAgain = async () => {
    setUserAnswers({});
    setShowExplanations(false);
    setAttemptResult(null);

    if (activeQuizId) {
      try {
        const attemptResp = await studentApi.startQuizAttempt(activeQuizId);
        if (attemptResp && attemptResp.attempt_id) {
          setActiveAttemptId(attemptResp.attempt_id);
        }
      } catch (err) {
        console.error("Start new attempt error:", err);
      }
    }
  };

  // Determine questions list (either from attemptResult evaluation or base quiz mcqs)
  const evaluatedMcqsMap = new Map();
  if (attemptResult && Array.isArray(attemptResult.mcqs)) {
    attemptResult.mcqs.forEach((m) => evaluatedMcqsMap.set(String(m.mcq_id), m));
  }
  const baseMcqs = activeQuiz?.mcqs || [];

  return (
    <div className="space-y-6">
      {/* Header with Learner Category & Subject Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Interactive Quiz Practice</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Practice faculty-authored MCQs tailored to Fast and Slow learner tracks.</p>
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
                  handleResetOrTryAgain();
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  selectedLearnerType === "Fast" ? "bg-[#2563EB] text-white" : "text-[#64748B]"
                }`}
              >
                Fast Learner
              </button>
              <button
                onClick={() => {
                  setSelectedLearnerType("Slow");
                  handleResetOrTryAgain();
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  selectedLearnerType === "Slow" ? "bg-[#14B8A6] text-white" : "text-[#64748B]"
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
                handleResetOrTryAgain();
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

          {/* Module Selector */}
          {availableQuizzes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-[#64748B]">Module:</label>
              <select
                value={activeQuizId || ""}
                onChange={(e) => {
                  setSelectedQuizId(e.target.value);
                  handleResetOrTryAgain();
                }}
                className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
              >
                {availableQuizzes.map((q) => (
                  <option key={q.quiz_id || q.id} value={q.quiz_id || q.id}>
                    {q.title} ({(q.mcqs ? q.mcqs.length : q.total_questions) || 0} Qs)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Selected Quiz Card */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
          Loading published practice quizzes...
        </div>
      ) : activeQuiz ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeQuiz.learner_type === "Fast"
                      ? "bg-[#2563EB]/10 text-[#2563EB]"
                      : "bg-[#14B8A6]/10 text-[#14B8A6]"
                  }`}
                >
                  {activeQuiz.learner_type} Learner Category
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-bold">
                  {subjects.find((s) => (s.subject_id || s.id) === selectedSubjectId)?.subject_code || "MCQ"}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1E293B] mt-1">{activeQuiz.title}</h2>
              <p className="text-xs text-[#64748B]">{activeQuiz.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetOrTryAgain} icon={RefreshCw} className="text-xs">
                {showExplanations ? "Try Again" : "Reset"}
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleSubmitQuiz}
                disabled={showExplanations || submitting}
                className="text-xs"
              >
                {submitting ? "Evaluating..." : "Check Answers & Explanations"}
              </Button>
            </div>
          </div>

          {/* Attempt Result Banner */}
          {attemptResult && (
            <div className="p-4 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#2563EB] text-white rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E293B]">
                    Attempt #{attemptResult.attempt_number} Result: {attemptResult.score} Points ({attemptResult.percentage}%)
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    You correctly answered {attemptResult.correct_count} out of {attemptResult.total_questions} questions.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                Saved to Database
              </span>
            </div>
          )}

          {/* MCQs List */}
          <div className="space-y-4">
            {baseMcqs.length > 0 ? (
              baseMcqs.map((mcq, index) => {
                const mcqId = String(mcq.mcq_id || mcq.id);
                const evalData = evaluatedMcqsMap.get(mcqId);
                const selected = userAnswers[mcqId] || (evalData ? evalData.selected_option : null);
                
                const correctAnswerChoice = evalData ? evalData.correct_answer : null;
                const isCorrect = evalData ? evalData.is_correct : (selected && correctAnswerChoice ? selected === correctAnswerChoice : false);
                const explanationText = evalData ? evalData.explanation : null;

                return (
                  <div key={mcqId} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#1E293B]">
                        {index + 1}. {mcq.question}
                      </h3>
                      {showExplanations && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCorrect ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}
                        >
                          {isCorrect ? "Correct" : `Correct Option: ${correctAnswerChoice || "N/A"}`}
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
                        if (showExplanations && correctAnswerChoice && opt.key === correctAnswerChoice) {
                          btnStyle = "bg-[#22C55E]/10 border-[#22C55E] font-bold text-[#22C55E]";
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption(mcqId, opt.key)}
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
                        <span className="font-bold text-[#2563EB]">Server Rationale:</span>
                        <p className="text-[#64748B]">{explanationText || "No explanation provided."}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-[#F8FAFC] rounded-lg text-center text-xs text-[#64748B]">
                No practice questions added for this quiz module yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
          No published practice quizzes available for the selected subject and learner track.
        </div>
      )}
    </div>
  );
};

export default StudentQuizPractice;
