import React, { useState, useEffect } from "react";
import { HelpCircle, Plus, Edit, Trash2, CheckCircle2, ListPlus, BookOpen, X } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi, adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherQuizPractice = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("educonnect_user");
      const loggedUser = userStr ? JSON.parse(userStr) : null;
      const identifier = loggedUser?.identifier || loggedUser?.email || loggedUser?.userId;

      try {
        const [quizData, subData] = await Promise.all([
          teacherApi.getQuizzes(),
          teacherApi.getAssignedSubjects(identifier),
        ]);
        if (Array.isArray(quizData)) {
          setQuizzes(quizData);
          const allMcqs = quizData.flatMap((q) => q.mcqs || q.questions || []);
          setMcqs(allMcqs);
        }
        if (Array.isArray(subData)) {
          setSubjects(subData);
        }
      } catch (err) {
        console.error("Teacher quiz practice load error:", err);
      }
    };
    fetchData();
  }, []);

  // Add / Edit Quiz Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [learnerType, setLearnerType] = useState("Fast");

  // Add MCQ Question Modal States
  const [activeQuizForMcq, setActiveQuizForMcq] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctAns, setCorrectAns] = useState("A");
  const [explanation, setExplanation] = useState("");

  const handleOpenAddModal = () => {
    setEditingQuizId(null);
    setTitle("");
    setDesc("");
    setSubjectId(subjects[0]?.subject_id || subjects[0]?.id || "");
    setLearnerType("Fast");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (quiz) => {
    setEditingQuizId(quiz.quiz_id || quiz.id);
    setTitle(quiz.title || "");
    setDesc(quiz.description || "");
    setSubjectId(quiz.subject_id || "");
    setLearnerType(quiz.learner_type || quiz.category || "Fast");
    setShowAddModal(true);
  };

  const handleOpenManageQuestions = async (quiz) => {
    setActiveQuizForMcq(quiz);
    const quizId = quiz.quiz_id || quiz.id;
    if (quizId) {
      try {
        const qMcqs = await teacherApi.getQuizQuestions(quizId);
        if (Array.isArray(qMcqs)) {
          setMcqs((prev) => [
            ...prev.filter((m) => String(m.quiz_id || m.quizId) !== String(quizId)),
            ...qMcqs,
          ]);
        }
      } catch (err) {
        console.error("Error fetching quiz questions:", err);
      }
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Are you sure you want to delete this practice quiz and its questions?")) {
      try {
        await teacherApi.deleteQuiz(id);
        setQuizzes((prev) => prev.filter((q) => String(q.quiz_id || q.id) !== String(id)));
        setMcqs((prev) => prev.filter((m) => String(m.quiz_id || m.quizId) !== String(id)));
        notifySuccess("Practice Quiz deleted from database!");
      } catch (err) {
        console.error("Error deleting practice quiz:", err);
        notifyError("Failed to delete quiz from database.");
      }
    }
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      description: desc,
      subject_id: subjectId,
      learner_type: learnerType,
      category: learnerType,
    };

    try {
      if (editingQuizId) {
        const updated = await teacherApi.updateQuiz(editingQuizId, payload);
        if (updated) {
          setQuizzes((prev) =>
            prev.map((q) => (String(q.quiz_id || q.id) === String(editingQuizId) ? { ...q, ...updated } : q))
          );
          notifySuccess(`Practice Quiz '${title}' updated in database!`);
        }
      } else {
        const createdRes = await teacherApi.createQuiz(payload);
        if (createdRes) {
          setQuizzes((prev) => [...prev, createdRes]);
          notifySuccess(`Practice Quiz '${title}' created and saved to database!`);
        }
      }
    } catch (err) {
      console.error("Error saving practice quiz:", err);
      notifyError("Failed to save quiz to database.");
    }

    setShowAddModal(false);
    setEditingQuizId(null);
  };

  // Add MCQ Question to Quiz
  const handleAddMcqQuestion = async (e) => {
    e.preventDefault();
    if (!activeQuizForMcq) return;

    const quizId = activeQuizForMcq.quiz_id || activeQuizForMcq.id;
    const newMcqObj = {
      question: newQuestion,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correctAns,
      explanation: explanation,
    };

    try {
      const addedMcq = await teacherApi.addQuizQuestion(quizId, newMcqObj);
      if (addedMcq) {
        setMcqs((prev) => [...prev, addedMcq]);
        setQuizzes((prev) =>
          prev.map((q) =>
            String(q.quiz_id || q.id) === String(quizId)
              ? {
                  ...q,
                  total_questions: (q.total_questions || 0) + 1,
                  mcqs: [...(q.mcqs || []), addedMcq],
                }
              : q
          )
        );
        notifySuccess("MCQ question saved to database successfully!");
      }
    } catch (err) {
      console.error("Error adding MCQ question:", err);
      notifyError("Failed to save MCQ question to database.");
    }

    // Reset Form
    setNewQuestion("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectAns("A");
    setExplanation("");
  };

  const handleDeleteMcq = async (mcqId) => {
    if (!activeQuizForMcq) return;
    const quizId = activeQuizForMcq.quiz_id || activeQuizForMcq.id;

    try {
      const updatedQuestions = await teacherApi.deleteQuizQuestion(quizId, mcqId);
      setMcqs((prev) => prev.filter((m) => String(m.mcq_id || m.id) !== String(mcqId)));
      setQuizzes((prev) =>
        prev.map((q) =>
          String(q.quiz_id || q.id) === String(quizId)
            ? {
                ...q,
                total_questions: Math.max(0, (q.total_questions || 1) - 1),
                mcqs: updatedQuestions,
              }
            : q
        )
      );
      notifySuccess("MCQ question deleted from database!");
    } catch (err) {
      console.error("Error deleting MCQ question:", err);
      notifyError("Failed to delete MCQ question.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Quiz Practice</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Add New Practice Quiz
        </Button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const quizId = quiz.quiz_id || quiz.id;
          const quizMcqsList = mcqs.filter((m) => String(m.quiz_id || m.quizId) === String(quizId));
          const quizMcqCount = quizMcqsList.length > 0 ? quizMcqsList.length : (quiz.total_questions || 0);
          const subj = subjects.find((s) => String(s.subject_id || s.id) === String(quiz.subject_id));
          const subjectName = subj ? (subj.subject_name || subj.name) : (quiz.subject_name || "");
          const subjectCode = subj ? (subj.subject_code || subj.code) : (quiz.subject_code || "");

          return (
            <div key={quizId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3 text-xs">
                {/* Header Badges */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      (quiz.learner_type || quiz.category) === "Fast"
                        ? "bg-[#2563EB]/10 text-[#2563EB]"
                        : "bg-[#14B8A6]/10 text-[#14B8A6]"
                    }`}
                  >
                    Category: {quiz.learner_type || quiz.category || "Fast"} Learner
                  </span>

                  {(subjectName || subjectCode) && (
                    <span className="font-mono text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {subjectName ? `${subjectName} (${subjectCode})` : subjectCode}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1E293B]">{quiz.title}</h3>
                  <p className="text-[#64748B] mt-0.5">{quiz.description}</p>
                </div>

                {/* Info Bar */}
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="font-bold text-[#2563EB]">{quizMcqCount} Questions Added</span>
                  <span className="font-medium text-[#14B8A6]">{quiz.time_limit_minutes || 15} Mins Limit</span>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  icon={ListPlus}
                  onClick={() => handleOpenManageQuestions(quiz)}
                  className="text-xs"
                >
                  Manage Questions ({quizMcqCount})
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleOpenEditModal(quiz)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteQuiz(quizId)}
                    className="text-xs !bg-[#EF4444]/10 !text-[#EF4444] hover:!bg-[#EF4444] hover:!text-white border-transparent"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Quiz Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editingQuizId ? "Edit Practice Quiz Details" : "Create Practice Quiz (quizzes)"}
            </h3>

            <form onSubmit={handleSaveQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Practice Title (title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. React Router & State Management"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Description (description)</label>
                <textarea
                  rows={2}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Enter practice objective or instructions..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Subject (subject_id)</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    {subjects.map((s) => (
                      <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                        {s.subject_code || s.code} - {s.subject_name || s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Learner Category (learner_type)</label>
                  <select
                    value={learnerType}
                    onChange={(e) => setLearnerType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="Fast">Fast Learner (Advanced)</option>
                    <option value="Slow">Slow Learner (Foundational)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  {editingQuizId ? "Save Changes" : "Save Practice Module"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage / Add Questions Modal */}
      {activeQuizForMcq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Manage Practice Questions (MCQs)</h3>
                <p className="text-xs text-[#64748B]">{activeQuizForMcq.title}</p>
              </div>
              <button
                onClick={() => setActiveQuizForMcq(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Questions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Current Practice Questions</h4>
              {mcqs.filter((m) => String(m.quiz_id || m.quizId) === String(activeQuizForMcq.quiz_id || activeQuizForMcq.id)).length === 0 ? (
                <p className="text-xs text-[#64748B] italic">No questions added yet. Use the form below to add questions.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {mcqs
                    .filter((m) => String(m.quiz_id || m.quizId) === String(activeQuizForMcq.quiz_id || activeQuizForMcq.id))
                    .map((mcq, idx) => {
                      const mcqId = mcq.mcq_id || mcq.id;
                      return (
                        <div key={mcqId} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-[#1E293B]">{idx + 1}. {mcq.question}</p>
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                              A: {mcq.option_a} | B: {mcq.option_b} | C: {mcq.option_c} | D: {mcq.option_d}
                            </p>
                            <span className="text-[10px] font-bold text-[#22C55E]">Correct: Option {mcq.correct_answer}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteMcq(mcqId)}
                            className="text-[#EF4444] hover:bg-[#EF4444]/10 p-1 rounded transition-colors shrink-0"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Add New Question Form */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
              <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add New Question (mcqs)
              </h4>

              <form onSubmit={handleAddMcqQuestion} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Question Text (question)</label>
                  <input
                    type="text"
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#64748B] mb-1">Option A</label>
                    <input
                      type="text"
                      required
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748B] mb-1">Option B</label>
                    <input
                      type="text"
                      required
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748B] mb-1">Option C</label>
                    <input
                      type="text"
                      required
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748B] mb-1">Option D</label>
                    <input
                      type="text"
                      required
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Correct Answer (correct_answer)</label>
                    <select
                      value={correctAns}
                      onChange={(e) => setCorrectAns(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-bold"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Explanation (explanation)</label>
                    <input
                      type="text"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Reason for correct answer..."
                      className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <Button variant="accent" size="sm" type="submit">
                    Add Question to Quiz
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizPractice;
