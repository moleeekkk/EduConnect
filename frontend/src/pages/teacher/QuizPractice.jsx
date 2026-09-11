import React, { useState, useEffect } from "react";
import { HelpCircle, Plus, Edit, Trash2, CheckCircle2, ListPlus, BookOpen, X, Send, Eye, Archive } from "lucide-react";
import Button from "../../components/common/Button";
import { teacherApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherQuizPractice = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Quiz Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [learnerType, setLearnerType] = useState("Fast");
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Manage MCQ Questions Modal States
  const [activeQuizForMcq, setActiveQuizForMcq] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [loadingMcqs, setLoadingMcqs] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctAns, setCorrectAns] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [addingMcq, setAddingMcq] = useState(false);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const [quizData, assignedSubs] = await Promise.all([
        teacherApi.getQuizzes(),
        teacherApi.getAssignedSubjects(),
      ]);

      if (Array.isArray(quizData)) {
        setQuizzes(quizData);
      }
      if (Array.isArray(assignedSubs)) {
        setSubjects(assignedSubs);
        if (assignedSubs.length > 0 && !subjectId) {
          setSubjectId(assignedSubs[0].subject_id || assignedSubs[0].id);
        }
      }
    } catch (err) {
      console.error("Teacher quiz data load error:", err);
      notifyError("Failed to load teacher quizzes and assigned subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingQuizId(null);
    setTitle("");
    setDesc("");
    const defaultSubId = subjects.length > 0 ? (subjects[0].subject_id || subjects[0].id) : "";
    setSubjectId(defaultSubId);
    setLearnerType("Fast");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (quiz) => {
    setEditingQuizId(quiz.quiz_id || quiz.id);
    setTitle(quiz.title || "");
    setDesc(quiz.description || "");
    const quizSubId = quiz.subject_id || (subjects.length > 0 ? (subjects[0].subject_id || subjects[0].id) : "");
    setSubjectId(quizSubId);
    setLearnerType(quiz.learner_type || "Fast");
    setShowAddModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      notifyError("Please enter a quiz title.");
      return;
    }
    if (!subjectId) {
      notifyError("Please select a subject allocation.");
      return;
    }

    try {
      setSavingQuiz(true);
      const payload = {
        title: title.trim(),
        description: desc.trim(),
        subject_id: subjectId,
        learner_type: learnerType,
      };

      if (editingQuizId) {
        await teacherApi.updateQuiz(editingQuizId, payload);
        notifySuccess(`Quiz '${title}' updated successfully!`);
      } else {
        await teacherApi.createQuiz(payload);
        notifySuccess(`Quiz '${title}' created successfully in draft mode!`);
      }

      await fetchTeacherData();
      setShowAddModal(false);
      setEditingQuizId(null);
    } catch (err) {
      console.error("Save quiz error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save practice quiz.";
      notifyError(`Error: ${msg}`);
    } finally {
      setSavingQuiz(false);
    }
  };

  const handlePublishQuiz = async (quiz) => {
    const qId = quiz.quiz_id || quiz.id;
    try {
      await teacherApi.publishQuiz(qId);
      notifySuccess(`Quiz '${quiz.title}' published successfully!`);
      await fetchTeacherData();
    } catch (err) {
      console.error("Publish quiz error:", err);
      const msg = err.response?.data?.message || err.message || "Cannot publish quiz.";
      notifyError(`Publish failed: ${msg}`);
    }
  };

  const handleArchiveQuiz = async (quiz) => {
    const qId = quiz.quiz_id || quiz.id;
    if (window.confirm(`Are you sure you want to archive quiz '${quiz.title}'?`)) {
      try {
        await teacherApi.archiveQuiz(qId);
        notifySuccess(`Quiz '${quiz.title}' archived successfully.`);
        await fetchTeacherData();
      } catch (err) {
        console.error("Archive quiz error:", err);
        const msg = err.response?.data?.message || err.message || "Cannot archive quiz.";
        notifyError(`Archive failed: ${msg}`);
      }
    }
  };

  const handleDeleteQuiz = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete practice quiz '${title}' and all its questions?`)) {
      try {
        await teacherApi.deleteQuiz(id);
        notifySuccess(`Quiz '${title}' deleted successfully!`);
        await fetchTeacherData();
      } catch (err) {
        console.error("Delete quiz error:", err);
        const msg = err.response?.data?.message || err.message || "Failed to delete quiz.";
        notifyError(`Delete failed: ${msg}`);
      }
    }
  };

  // Manage MCQ Questions Flow
  const handleOpenMcqModal = async (quiz) => {
    setActiveQuizForMcq(quiz);
    setNewQuestion("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectAns("A");
    setExplanation("");
    await fetchMcqs(quiz.quiz_id || quiz.id);
  };

  const fetchMcqs = async (quizId) => {
    try {
      setLoadingMcqs(true);
      const data = await teacherApi.getQuizMcqs(quizId);
      if (Array.isArray(data)) {
        setMcqs(data);
      }
    } catch (err) {
      console.error("Fetch MCQs error:", err);
      notifyError("Failed to load questions for this quiz.");
    } finally {
      setLoadingMcqs(false);
    }
  };

  const handleAddMcqQuestion = async (e) => {
    e.preventDefault();
    if (!activeQuizForMcq) return;

    const quizId = activeQuizForMcq.quiz_id || activeQuizForMcq.id;
    if (!newQuestion.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      notifyError("Question text and all four options are required.");
      return;
    }

    try {
      setAddingMcq(true);
      const payload = {
        question: newQuestion.trim(),
        option_a: optA.trim(),
        option_b: optB.trim(),
        option_c: optC.trim(),
        option_d: optD.trim(),
        correct_answer: correctAns,
        explanation: explanation.trim(),
      };

      await teacherApi.addQuizMcq(quizId, payload);
      notifySuccess("Question added to quiz successfully!");

      setNewQuestion("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setCorrectAns("A");
      setExplanation("");

      await fetchMcqs(quizId);
      await fetchTeacherData();
    } catch (err) {
      console.error("Add MCQ error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to add question.";
      notifyError(`Error: ${msg}`);
    } finally {
      setAddingMcq(false);
    }
  };

  const handleDeleteMcq = async (mcqId) => {
    if (!activeQuizForMcq) return;
    const quizId = activeQuizForMcq.quiz_id || activeQuizForMcq.id;

    if (window.confirm("Are you sure you want to delete this MCQ question?")) {
      try {
        await teacherApi.deleteQuizMcq(quizId, mcqId);
        notifySuccess("Question deleted successfully!");
        await fetchMcqs(quizId);
        await fetchTeacherData();
      } catch (err) {
        console.error("Delete MCQ error:", err);
        const msg = err.response?.data?.message || err.message || "Failed to delete question.";
        notifyError(`Delete failed: ${msg}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Practice Quiz & MCQ Authoring</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Author, publish, and manage interactive quizzes for Fast and Slow learners.</p>
        </div>

        <Button variant="accent" size="sm" icon={Plus} onClick={handleOpenAddModal} className="text-xs">
          Create Practice Quiz
        </Button>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
          Loading practice quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-[#64748B] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#1E293B]">No Practice Quizzes Found</h3>
          <p className="text-xs text-[#64748B]">Click "Create Practice Quiz" above to author practice modules for your active subject allocations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {quizzes.map((quiz) => {
            const qId = quiz.quiz_id || quiz.id;
            const quizMcqCount = quiz.total_questions || 0;
            const subjCode = quiz.subject_code || "MCA";
            const subjName = quiz.subject_name || "Subject";
            const isPublished = Boolean(quiz.is_published);

            return (
              <div key={qId} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E2E8F0] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          quiz.learner_type === "Fast"
                            ? "bg-[#2563EB]/10 text-[#2563EB]"
                            : "bg-[#14B8A6]/10 text-[#14B8A6]"
                        }`}
                      >
                        {quiz.learner_type} Learner
                      </span>
                      {isPublished ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded font-bold text-[10px]">
                        {subjCode}
                      </span>
                      <span className="font-bold text-[#64748B] text-[11px]">{quizMcqCount} MCQs</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">{quiz.title}</h3>
                    <span className="text-[11px] font-semibold text-[#64748B] block mt-0.5">{subjName}</span>
                    <p className="text-[#64748B] mt-1 line-clamp-2">{quiz.description}</p>
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={ListPlus}
                    onClick={() => handleOpenMcqModal(quiz)}
                    className="text-xs"
                  >
                    Manage Questions ({quizMcqCount})
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {!isPublished ? (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Send}
                        onClick={() => handlePublishQuiz(quiz)}
                        className="text-xs !bg-emerald-50 !text-emerald-700 !border-emerald-200 hover:!bg-emerald-600 hover:!text-white"
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Archive}
                        onClick={() => handleArchiveQuiz(quiz)}
                        className="text-xs !text-amber-700 hover:!bg-amber-100"
                      >
                        Archive
                      </Button>
                    )}

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
                      onClick={() => handleDeleteQuiz(qId, quiz.title)}
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
      )}

      {/* Add / Edit Quiz Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editingQuizId ? "Edit Practice Quiz Details" : "Create Practice Quiz Module"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] mb-1 font-medium">Practice Title</label>
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
                <label className="block text-[#64748B] mb-1 font-medium">Description</label>
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
                  <label className="block text-[#64748B] mb-1 font-medium">Subject Allocation</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#1E293B]"
                  >
                    {subjects.map((s) => {
                      const sId = s.subject_id || s.id;
                      const sCode = s.subject_code || s.code || "";
                      const sName = s.subject_name || s.name || "Subject";
                      return (
                        <option key={sId} value={sId}>
                          {sCode ? `${sCode} - ${sName}` : sName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-medium">Learner Category</label>
                  <select
                    value={learnerType}
                    onChange={(e) => setLearnerType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-semibold"
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
                <Button variant="accent" size="sm" type="submit" disabled={savingQuiz}>
                  {savingQuiz ? "Saving..." : editingQuizId ? "Save Changes" : "Save Practice Module"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Questions Modal */}
      {activeQuizForMcq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 max-h-[90vh] flex flex-col my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Manage Practice MCQs</h3>
                <p className="text-xs text-[#64748B]">{activeQuizForMcq.title}</p>
              </div>
              <button
                onClick={() => setActiveQuizForMcq(null)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1 custom-scrollbar">
              {/* Existing Questions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                  Current Questions ({mcqs.length})
                </h4>

                {loadingMcqs ? (
                  <p className="text-xs text-[#64748B]">Loading questions...</p>
                ) : mcqs.length === 0 ? (
                  <p className="text-xs text-[#64748B] italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No questions added yet. Use the form below to add MCQs.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                    {mcqs.map((mcq, idx) => (
                      <div key={mcq.mcq_id || mcq.id} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-bold text-[#1E293B]">{idx + 1}. {mcq.question}</p>
                          <div className="grid grid-cols-2 gap-x-4 text-[11px] text-[#64748B]">
                            <span>A: {mcq.option_a}</span>
                            <span>B: {mcq.option_b}</span>
                            <span>C: {mcq.option_c}</span>
                            <span>D: {mcq.option_d}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 block">
                            Correct Answer: Option {mcq.correct_answer}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteMcq(mcq.mcq_id || mcq.id)}
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
                  <Plus className="w-4 h-4" /> Add New MCQ Question
                </h4>

                <form onSubmit={handleAddMcqQuestion} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Question Text</label>
                    <input
                      type="text"
                      required
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter MCQ question..."
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
                      <label className="block text-[#64748B] mb-1 font-medium">Correct Choice</label>
                      <select
                        value={correctAns}
                        onChange={(e) => setCorrectAns(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#1E293B]"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#64748B] mb-1 font-medium">Explanation</label>
                      <input
                        type="text"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Rationale for correct answer..."
                        className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                    <Button variant="accent" size="sm" type="submit" disabled={addingMcq}>
                      {addingMcq ? "Adding..." : "Add Question to Quiz"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizPractice;
