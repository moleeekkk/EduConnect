import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle, XCircle, Sparkles, RefreshCw, BookOpen, Clock, Award, X, Trophy, AlertTriangle, Play } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentQuizPractice = () => {
  const [selectedLearnerType, setSelectedLearnerType] = useState("Fast");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Active Quiz Modal States
  const [activeQuizModal, setActiveQuizModal] = useState(null); // Active quiz object or null
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const enrollmentNo = loggedUser?.enrollmentNo || loggedUser?.enrollment_no || loggedUser?.identifier || "2024MCA001";

      try {
        const [quizData, subjectData] = await Promise.all([
          studentApi.getQuizzes(enrollmentNo),
          studentApi.getSubjects(enrollmentNo),
        ]);
        if (Array.isArray(quizData)) {
          setQuizzes(quizData);
        }
        if (Array.isArray(subjectData)) {
          setSubjects(subjectData);
        }
      } catch (err) {
        console.error("Quiz practice data load error:", err);
      }
    };
    fetchData();
  }, []);

  // Live Timer Countdown Effect for Active Quiz Modal
  useEffect(() => {
    if (!activeQuizModal || isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuizAuto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuizModal, isSubmitted, timeLeft]);

  // Open Quiz Modal & Start Timer
  const handleStartQuiz = (quiz) => {
    setActiveQuizModal(quiz);
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);

    const minutes = quiz.time_limit_minutes || quiz.timeLimitMinutes || 15;
    setTimeLeft(minutes * 60);
  };

  // Option Selection inside Modal
  const handleSelectOption = (mcqId, option) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [mcqId]: option }));
  };

  // Calculate & Submit Quiz Results
  const handleSubmitQuiz = () => {
    if (!activeQuizModal) return;

    const quizMcqs = activeQuizModal.mcqs || activeQuizModal.questions || [];
    let correctCount = 0;
    quizMcqs.forEach((mcq) => {
      const mcqId = mcq.mcq_id || mcq.id;
      if (userAnswers[mcqId] === mcq.correct_answer) {
        correctCount += 1;
      }
    });

    const total = quizMcqs.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    setScoreResult({
      score: correctCount,
      total,
      percentage,
    });
    setIsSubmitted(true);
  };

  const handleSubmitQuizAuto = () => {
    handleSubmitQuiz();
  };

  const handleCloseModal = () => {
    if (!isSubmitted && activeQuizModal && Object.keys(userAnswers).length > 0) {
      if (!window.confirm("Quiz is in progress. Are you sure you want to exit? Your progress will be lost.")) {
        return;
      }
    }
    setActiveQuizModal(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScoreResult(null);
    const minutes = activeQuizModal?.time_limit_minutes || 15;
    setTimeLeft(minutes * 60);
  };

  // Format Timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Filter Quizzes by Learner Category, Subject Selection, and Must Have MCQs
  const filteredQuizzes = quizzes.filter((q) => {
    const mcqsList = q.mcqs || q.questions || [];
    if (mcqsList.length === 0) return false;

    // Learner Category Match: "Fast" vs "Slow"
    const cat = (q.learner_type || q.category || "Fast").toLowerCase();
    const matchCat = selectedLearnerType === "Fast"
      ? cat.includes("fast") || (!cat.includes("slow"))
      : cat.includes("slow");

    // Subject Match
    const matchSubj = !selectedSubjectId || String(q.subject_id) === String(selectedSubjectId);

    return matchCat && matchSubj;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Interactive Quiz Practice</h1>

        </div>

        {/* Category & Subject Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-[#64748B]">Category:</label>
            <div className="inline-flex rounded-lg border border-[#E2E8F0] p-1 bg-[#F8FAFC]">
              <button
                onClick={() => setSelectedLearnerType("Fast")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedLearnerType === "Fast" ? "bg-[#2563EB] text-white shadow-xs" : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
              >
                Fast Learner
              </button>
              <button
                onClick={() => setSelectedLearnerType("Slow")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedLearnerType === "Slow" ? "bg-[#14B8A6] text-white shadow-xs" : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
              >
                Slow Learner
              </button>
            </div>
          </div>

          {/* Subject Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-[#64748B]">Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
            >
              <option value="">-- All Matching Subjects --</option>
              {subjects.map((subj) => (
                <option key={subj.subject_id || subj.id || subj.code} value={subj.subject_id || subj.id}>
                  {subj.subject_name || subj.name} ({subj.subject_code || subj.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => {
            const quizId = quiz.quiz_id || quiz.id;
            const mcqsList = quiz.mcqs || quiz.questions || [];
            const mcqCount = mcqsList.length;
            const timeMins = quiz.time_limit_minutes || quiz.timeLimitMinutes || 15;
            const subj = subjects.find((s) => String(s.subject_id || s.id) === String(quiz.subject_id));
            const subjectName = subj ? (subj.subject_name || subj.name) : (quiz.subject_name || "");
            const subjectCode = subj ? (subj.subject_code || subj.code) : (quiz.subject_code || "");
            const categoryLabel = quiz.learner_type || quiz.category || selectedLearnerType;

            return (
              <div
                key={quizId}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${categoryLabel === "Fast"
                          ? "bg-[#2563EB]/10 text-[#2563EB]"
                          : "bg-[#14B8A6]/10 text-[#14B8A6]"
                        }`}
                    >
                      {categoryLabel} Learner
                    </span>

                    {(subjectName || subjectCode) && (
                      <span className="font-mono text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {subjectName ? `${subjectName} (${subjectCode})` : subjectCode}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-2 mt-0.5">{quiz.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="flex items-center gap-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                      {mcqCount} Questions
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#14B8A6]" />
                      {timeMins} Mins Limit
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Play}
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full text-xs justify-center"
                  >
                    Start Practice Quiz
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-8 rounded-xl border border-[#E2E8F0] text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-[#64748B] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[#1E293B]">No Quizzes Available</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              There are currently no practice quizzes with questions listed under the <strong className="text-[#2563EB]">{selectedLearnerType} Learner</strong> category for your department and semester.
            </p>
          </div>
        )}
      </div>

      {/* Start Quiz Interactive Popup Modal */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${(activeQuizModal.learner_type || activeQuizModal.category) === "Fast"
                        ? "bg-[#2563EB]/10 text-[#2563EB]"
                        : "bg-[#14B8A6]/10 text-[#14B8A6]"
                      }`}
                  >
                    {activeQuizModal.learner_type || activeQuizModal.category || selectedLearnerType} Category
                  </span>
                  <h3 className="text-base font-bold text-[#1E293B]">{activeQuizModal.title}</h3>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">{activeQuizModal.description}</p>
              </div>

              {/* Live Timer or Results Badge */}
              <div className="flex items-center gap-3">
                {!isSubmitted ? (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-bold text-xs ${timeLeft < 120
                        ? "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444] animate-pulse"
                        : "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                      }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time Left: {formatTime(timeLeft)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#22C55E]/10 text-[#22C55E] font-bold text-xs">
                    <Trophy className="w-4 h-4" />
                    <span>Quiz Submitted</span>
                  </div>
                )}

                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Score Result Summary Banner (Shown after Submission) */}
            {isSubmitted && scoreResult && (
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${scoreResult.percentage >= 70
                    ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#15803D]"
                    : scoreResult.percentage >= 40
                      ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#B45309]"
                      : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#B91C1C]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-white shadow-xs">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Quiz Performance Summary</h4>
                    <p className="text-xs opacity-90">
                      You scored <strong>{scoreResult.score}</strong> out of <strong>{scoreResult.total}</strong> questions correctly ({scoreResult.percentage}%).
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <span className="text-2xl font-extrabold font-mono">{scoreResult.percentage}%</span>
                </div>
              </div>
            )}

            {/* Questions List Body */}
            <div className="overflow-y-auto flex-1 custom-scrollbar pr-1 space-y-4">
              {(() => {
                const quizMcqs = activeQuizModal.mcqs || activeQuizModal.questions || [];

                return quizMcqs.map((mcq, index) => {
                  const mcqId = mcq.mcq_id || mcq.id;
                  const selected = userAnswers[mcqId];
                  const isCorrect = selected === mcq.correct_answer;

                  return (
                    <div key={mcqId} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#1E293B]">
                          {index + 1}. {mcq.question}
                        </h3>
                        {isSubmitted && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCorrect ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#EF4444]/10 text-[#EF4444]"
                              }`}
                          >
                            {isCorrect ? "Correct (+1)" : `Correct Option: ${mcq.correct_answer}`}
                          </span>
                        )}
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: "A", val: mcq.option_a },
                          { key: "B", val: mcq.option_b },
                          { key: "C", val: mcq.option_c },
                          { key: "D", val: mcq.option_d },
                        ].map((opt) => {
                          let btnStyle = "bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#2563EB]/50";

                          if (selected === opt.key) {
                            btnStyle = "bg-[#2563EB]/10 border-[#2563EB] font-bold text-[#2563EB]";
                          }

                          if (isSubmitted) {
                            if (opt.key === mcq.correct_answer) {
                              btnStyle = "bg-[#22C55E]/10 border-[#22C55E] font-bold text-[#22C55E]";
                            } else if (selected === opt.key && !isCorrect) {
                              btnStyle = "bg-[#EF4444]/10 border-[#EF4444] font-bold text-[#EF4444]";
                            }
                          }

                          return (
                            <button
                              key={opt.key}
                              disabled={isSubmitted}
                              onClick={() => handleSelectOption(mcqId, opt.key)}
                              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${btnStyle} ${!isSubmitted ? "cursor-pointer" : "cursor-default"
                                }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                                {opt.key}
                              </span>
                              <span>{opt.val}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Section */}
                      {isSubmitted && mcq.explanation && (
                        <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] text-[11px] space-y-1">
                          <span className="font-bold text-[#2563EB]">Faculty Explanation:</span>
                          <p className="text-[#64748B]">{mcq.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] shrink-0">
              {!isSubmitted ? (
                <>
                  <span className="text-xs text-[#64748B] font-mono">
                    Answered {Object.keys(userAnswers).length} of{" "}
                    {(activeQuizModal.mcqs || activeQuizModal.questions || []).length}
                  </span>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCloseModal}>
                      Cancel
                    </Button>
                    <Button variant="accent" size="sm" onClick={handleSubmitQuiz}>
                      Submit Practice Quiz
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleRetakeQuiz}>
                    Retake Quiz
                  </Button>
                  <Button variant="accent" size="sm" onClick={handleCloseModal}>
                    Close Results
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizPractice;
