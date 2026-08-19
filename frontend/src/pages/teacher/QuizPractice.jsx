import React, { useState } from "react";
import { Plus, Edit, Trash2, ListPlus, X } from "lucide-react";
import Button from "../../components/common/Button";
import { mockQuizzes, mockMcqs, mockSubjects } from "../../data/mockData";

const TeacherQuizPractice = () => {
  const [quizzes, setQuizzes] = useState(mockQuizzes || []);
  const [mcqs, setMcqs] = useState(mockMcqs || []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subjectId, setSubjectId] = useState(mockSubjects && mockSubjects.length > 0 ? mockSubjects[0].subject_id : "");
  const [learnerType, setLearnerType] = useState("Fast");

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
    setSubjectId(mockSubjects && mockSubjects.length > 0 ? mockSubjects[0].subject_id : "");
    setLearnerType("Fast");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (quiz) => {
    setEditingQuizId(quiz.quiz_id);
    setTitle(quiz.title);
    setDesc(quiz.description);
    setSubjectId(quiz.subject_id || "");
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
      const created = {
        quiz_id: `quiz-${Date.now()}`,
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

  const handleAddMcqQuestion = (e) => {
    e.preventDefault();
    if (!activeQuizForMcq) return;

    const newMcqObj = {
      mcq_id: `mcq-${Date.now()}`,
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

    setQuizzes(
      quizzes.map((q) =>
        q.quiz_id === activeQuizForMcq.quiz_id
          ? { ...q, total_questions: (q.total_questions || 0) + 1 }
          : q
      )
    );

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
          <h1 className="text-xl font-bold text-[#1E293B]">Quiz Practice</h1>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Add New Practice Quiz
        </Button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => {
            const quizMcqCount = mcqs.filter((m) => m.quiz_id === quiz.quiz_id).length;
            const subj = (mockSubjects || []).find((s) => s.subject_id === quiz.subject_id);

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
                    {subj && (
                      <span className="font-mono text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded font-bold text-[10px]">
                        {subj.subject_code}
                      </span>
                    )}
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
          })
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] shadow-xs col-span-full">
            No practice quizzes created yet.
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
              {editingQuizId ? "Edit Practice Quiz Details" : "Create Practice Quiz"}
            </h3>

            <form onSubmit={handleSaveQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Practice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Practice Title..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Instructions..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    {mockSubjects && mockSubjects.length > 0 ? (
                      mockSubjects.map((s) => (
                        <option key={s.subject_id} value={s.subject_id}>
                          {s.subject_code} - {s.subject_name}
                        </option>
                      ))
                    ) : (
                      <option value="">No Subjects</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Learner Category</label>
                  <select
                    value={learnerType}
                    onChange={(e) => setLearnerType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <option value="Fast">Fast Learner</option>
                    <option value="Slow">Slow Learner</option>
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
    </div>
  );
};

export default TeacherQuizPractice;
