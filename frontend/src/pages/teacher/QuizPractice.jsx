import React, { useState } from "react";
import { HelpCircle, Plus, Edit, Trash2, CheckCircle2, ListPlus, BookOpen } from "lucide-react";
import Button from "../../components/common/Button";
import { mockQuizzes, mockMcqs, mockSubjects } from "../../data/mockData";

const TeacherQuizPractice = () => {
  const [quizzes, setQuizzes] = useState(mockQuizzes);
  const [mcqs, setMcqs] = useState(mockMcqs);

  // Add / Edit Quiz Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subjectId, setSubjectId] = useState("subj-101");
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
    setSubjectId("subj-101");
    setLearnerType("Fast");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (quiz) => {
    setEditingQuizId(quiz.quiz_id);
    setTitle(quiz.title);
    setDesc(quiz.description);
    setSubjectId(quiz.subject_id || "subj-101");
    setLearnerType(quiz.learner_type);
    setShowAddModal(true);
  };

  const handleDeleteQuiz = (id) => {
    if (window.confirm("Are you sure you want to delete this practice quiz and its questions?")) {
      setQuizzes(quizzes.filter((q) => q.quiz_id !== id));
      setMcqs(mcqs.filter((m) => m.quiz_id !== id));
    }
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();
    if (editingQuizId) {
      // Edit Quiz
      setQuizzes(
        quizzes.map((q) =>
          q.quiz_id === editingQuizId
            ? {
                ...q,
                title,
                description: desc,
                subject_id: subjectId,
                learner_type: learnerType,
                updated_at: new Date().toISOString(),
              }
            : q
        )
      );
    } else {
      // Create Quiz
      const created = {
        quiz_id: `quiz-00${quizzes.length + 1}`,
        teacher_subject_id: "ts-001",
        subject_id: subjectId,
        title,
        description: desc,
        learner_type: learnerType,
        total_questions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setQuizzes([...quizzes, created]);
    }

    setShowAddModal(false);
    setEditingQuizId(null);
  };

  // Add MCQ Question to Quiz
  const handleAddMcqQuestion = (e) => {
    e.preventDefault();
    if (!activeQuizForMcq) return;

    const newMcqObj = {
      mcq_id: `mcq-00${mcqs.length + 1}`,
      quiz_id: activeQuizForMcq.quiz_id,
      question: newQuestion,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correctAns,
      explanation: explanation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMcqs([...mcqs, newMcqObj]);

    // Update Question Count in Quiz
    setQuizzes(
      quizzes.map((q) =>
        q.quiz_id === activeQuizForMcq.quiz_id
          ? { ...q, total_questions: (q.total_questions || 0) + 1 }
          : q
      )
    );

    // Reset Form
    setNewQuestion("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectAns("A");
    setExplanation("");
  };

  const handleDeleteMcq = (mcqId) => {
    setMcqs(mcqs.filter((m) => m.mcq_id !== mcqId));
    if (activeQuizForMcq) {
      setQuizzes(
        quizzes.map((q) =>
          q.quiz_id === activeQuizForMcq.quiz_id
            ? { ...q, total_questions: Math.max(0, (q.total_questions || 1) - 1) }
            : q
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Manage Practice Quizzes & MCQs (quizzes & mcqs)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Create practice quizzes, edit details, add MCQ practice questions, and delete modules</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Add New Practice Quiz
        </Button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const quizMcqCount = mcqs.filter((m) => m.quiz_id === quiz.quiz_id).length;
          const subj = mockSubjects.find((s) => s.subject_id === quiz.subject_id);

          return (
            <div key={quiz.quiz_id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      quiz.learner_type === "Fast"
                        ? "bg-[#2563EB]/10 text-[#2563EB]"
                        : "bg-[#14B8A6]/10 text-[#14B8A6]"
                    }`}
                  >
                    Category: {quiz.learner_type} Learner
                  </span>
                  <span className="font-mono text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded font-bold text-[10px]">
                    {subj ? subj.subject_code : "MCA"}
                  </span>
                  <span className="font-bold text-[#64748B] text-[11px]">{quizMcqCount} Questions</span>
                </div>

                <h3 className="text-sm font-bold text-[#1E293B]">{quiz.title}</h3>
                <p className="text-[#64748B]">{quiz.description}</p>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  icon={ListPlus}
                  onClick={() => setActiveQuizForMcq(quiz)}
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
                    onClick={() => handleDeleteQuiz(quiz.quiz_id)}
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
                    {mockSubjects.map((s) => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_code} - {s.subject_name}
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
              <Button variant="outline" size="sm" onClick={() => setActiveQuizForMcq(null)}>
                Close
              </Button>
            </div>

            {/* Existing Questions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Current Practice Questions</h4>
              {mcqs.filter((m) => m.quiz_id === activeQuizForMcq.quiz_id).length === 0 ? (
                <p className="text-xs text-[#64748B] italic">No questions added yet. Use the form below to add questions.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {mcqs
                    .filter((m) => m.quiz_id === activeQuizForMcq.quiz_id)
                    .map((mcq, idx) => (
                      <div key={mcq.mcq_id} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-[#1E293B]">{idx + 1}. {mcq.question}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            A: {mcq.option_a} | B: {mcq.option_b} | C: {mcq.option_c} | D: {mcq.option_d}
                          </p>
                          <span className="text-[10px] font-bold text-[#22C55E]">Correct: Option {mcq.correct_answer}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteMcq(mcq.mcq_id)}
                          className="text-[#EF4444] hover:bg-[#EF4444]/10 p-1 rounded transition-colors shrink-0"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
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
