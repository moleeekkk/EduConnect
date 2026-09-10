import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle, XCircle, Sparkles, RefreshCw, BookOpen } from "lucide-react";
import Button from "../../components/common/Button";
import { studentApi } from "../../services/api";

const StudentQuizPractice = () => {
  const [selectedLearnerType, setSelectedLearnerType] = useState("Fast");
  const [selectedSubjectId, setSelectedSubjectId] = useState("subj-101");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState(false);

  const [quizzes, setQuizzes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const localQuizzesStr = localStorage.getItem("educonnect_quizzes");
      const localMcqsStr = localStorage.getItem("educonnect_quiz_mcqs");

      const defaultQuizzes = [
        {
          quiz_id: "quiz-001",
          id: "quiz-001",
          subject_id: "subj-101",
          title: "Java OOPs & Multithreading Practice",
          description: "Foundational practice MCQs on Java classes, inheritance, threads & concurrency.",
          learner_type: "Fast",
          total_questions: 2,
        },
        {
          quiz_id: "quiz-002",
          id: "quiz-002",
          subject_id: "subj-102",
          title: "Microservices Architecture Basics",
          description: "Practice questions covering REST endpoints, API gateway & JWT tokens.",
          learner_type: "Slow",
          total_questions: 1,
        },
      ];

      const defaultMcqs = [
        {
          mcq_id: "mcq-001",
          id: "mcq-001",
          quiz_id: "quiz-001",
          question: "Which Java keyword is used to implement multiple inheritance through interfaces?",
          option_a: "extends",
          option_b: "implements",
          option_c: "inherits",
          option_d: "using",
          correct_answer: "B",
          explanation: "In Java, a class uses the 'implements' keyword to inherit behavior from interfaces.",
        },
        {
          mcq_id: "mcq-002",
          id: "mcq-002",
          quiz_id: "quiz-001",
          question: "What is the entry point method executed when a Java Thread is started via thread.start()?",
          option_a: "init()",
          option_b: "start()",
          option_c: "run()",
          option_d: "execute()",
          correct_answer: "C",
          explanation: "Calling start() creates a new call stack and triggers the thread's run() method.",
        },
        {
          mcq_id: "mcq-003",
          id: "mcq-003",
          quiz_id: "quiz-002",
          question: "What type of authentication header is typically used to transmit JWT tokens in Microservices?",
          option_a: "Basic Auth",
          option_b: "Bearer Token (Authorization)",
          option_c: "Session ID",
          option_d: "Cookie Token",
          correct_answer: "B",
          explanation: "JWT tokens are sent in the 'Authorization: Bearer <token>' header.",
        },
      ];

      const localQuizzes = localQuizzesStr ? JSON.parse(localQuizzesStr) : defaultQuizzes;
      const localMcqs = localMcqsStr ? JSON.parse(localMcqsStr) : defaultMcqs;

      try {
        const [quizData, syllabusData] = await Promise.all([
          studentApi.getQuizzes(),
          studentApi.getSyllabus(),
        ]);

        let finalQuizzes = localQuizzes;
        if (Array.isArray(quizData) && quizData.length > 0) {
          const map = new Map();
          localQuizzes.forEach((q) => map.set(q.quiz_id || q.id, q));
          quizData.forEach((q) => map.set(q.quiz_id || q.id, q));
          finalQuizzes = Array.from(map.values());
        }

        const defaultSubjects = [
          { subject_id: "subj-101", id: "subj-101", subject_code: "MCA101", code: "MCA101", subject_name: "Enterprise Java Architecture", name: "Enterprise Java Architecture" },
          { subject_id: "subj-102", id: "subj-102", subject_code: "MCA102", code: "MCA102", subject_name: "Cloud Microservices & JWT Security", name: "Cloud Microservices & JWT Security" },
          { subject_id: "subj-103", id: "subj-103", subject_code: "MCA103", code: "MCA103", subject_name: "Relational Database Systems (PostgreSQL)", name: "Relational Database Systems (PostgreSQL)" },
        ];

        const rawSubs = Array.isArray(syllabusData) && syllabusData.length > 0 ? syllabusData : defaultSubjects;
        setSubjects(rawSubs);
        setQuizzes(finalQuizzes);
        setMcqs(localMcqs);

        if (rawSubs.length > 0) {
          setSelectedSubjectId(rawSubs[0].subject_id || rawSubs[0].id || "subj-101");
        }
      } catch (err) {
        console.error("Quiz load error:", err);
        setQuizzes(localQuizzes);
        setMcqs(localMcqs);
        setSubjects([
          { subject_id: "subj-101", id: "subj-101", subject_code: "MCA101", code: "MCA101", subject_name: "Enterprise Java Architecture", name: "Enterprise Java Architecture" },
          { subject_id: "subj-102", id: "subj-102", subject_code: "MCA102", code: "MCA102", subject_name: "Cloud Microservices & JWT Security", name: "Cloud Microservices & JWT Security" },
          { subject_id: "subj-103", id: "subj-103", subject_code: "MCA103", code: "MCA103", subject_name: "Relational Database Systems (PostgreSQL)", name: "Relational Database Systems (PostgreSQL)" },
        ]);
      }
    };
    fetchData();
  }, []);

  // Filter Quizzes by selected Learner Type & Subject
  const matchingQuizzes = quizzes.filter((q) => {
    const catMatch = !selectedLearnerType || (q.learner_type || "").toLowerCase() === selectedLearnerType.toLowerCase();
    const qSubId = q.subject_id || q.subjectId || "";
    
    // Find subject code for selectedSubjectId
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
  const quizMcqs = mcqs.filter((m) => String(m.quiz_id || m.quizId) === String(activeQuiz?.quiz_id || activeQuiz?.id)) || activeQuiz?.mcqs || [];

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

          {/* Module Selector */}
          {availableQuizzes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-[#64748B]">Module:</label>
              <select
                value={activeQuiz?.quiz_id || activeQuiz?.id || ""}
                onChange={(e) => {
                  setSelectedQuizId(e.target.value);
                  resetQuiz();
                }}
                className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#1E293B] cursor-pointer outline-none focus:border-[#2563EB]"
              >
                {availableQuizzes.map((q) => (
                  <option key={q.quiz_id || q.id} value={q.quiz_id || q.id}>
                    {q.title} ({(mcqs.filter(m => (m.quiz_id || m.quizId) === (q.quiz_id || q.id)).length) || q.total_questions || 0} Qs)
                  </option>
                ))}
              </select>
            </div>
          )}
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
