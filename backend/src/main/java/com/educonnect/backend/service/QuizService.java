package com.educonnect.backend.service;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizMcqRepository quizMcqRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final StudentRepository studentRepository;
    private final StudentService studentService;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAttemptAnswerRepository quizAttemptAnswerRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherQuizzes(String identifier) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        List<Quiz> quizzes = quizRepository.findByTeacherIdAndIsArchivedFalseOrderByCreatedAtDesc(teacher.getTeacherId());

        if (quizzes.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> subjectIds = quizzes.stream().map(Quiz::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Quiz q : quizzes) {
            result.add(mapQuizToMap(q, subjectMap.get(q.getSubjectId())));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> createTeacherQuiz(String identifier, Map<String, Object> body) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);

        String title = parseString(body.get("title"));
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Quiz title is required.");
        }

        UUID rawSubjectId = parseUuid(body.get("subject_id"));
        if (rawSubjectId == null) {
            rawSubjectId = parseUuid(body.get("subjectId"));
        }
        if (rawSubjectId == null) {
            throw new IllegalArgumentException("Subject ID is required.");
        }
        final UUID subjectId = rawSubjectId;

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with id: " + subjectId));

        validateTeacherSubjectAllocation(teacher.getTeacherId(), subjectId);

        String description = parseString(body.get("description"));
        String learnerType = parseString(body.get("learner_type"));
        if (learnerType == null || (!learnerType.equalsIgnoreCase("Fast") && !learnerType.equalsIgnoreCase("Slow"))) {
            learnerType = "Fast";
        } else {
            learnerType = learnerType.substring(0, 1).toUpperCase() + learnerType.substring(1).toLowerCase();
        }

        Quiz quiz = Quiz.builder()
                .teacherId(teacher.getTeacherId())
                .subjectId(subjectId)
                .departmentId(subject.getDepartmentId())
                .semesterId(subject.getSemesterId())
                .title(title.trim())
                .description(description != null ? description.trim() : "")
                .learnerType(learnerType)
                .totalQuestions(0)
                .isPublished(false)
                .isArchived(false)
                .build();

        Quiz saved = quizRepository.save(quiz);
        return mapQuizToMap(saved, subject);
    }

    @Transactional
    public Map<String, Object> updateTeacherQuiz(String identifier, UUID quizId, Map<String, Object> body) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        validateTeacherOwnership(teacher.getTeacherId(), quiz);

        String title = parseString(body.get("title"));
        if (title != null && !title.trim().isEmpty()) {
            quiz.setTitle(title.trim());
        }

        String description = parseString(body.get("description"));
        if (description != null) {
            quiz.setDescription(description.trim());
        }

        String learnerType = parseString(body.get("learner_type"));
        if (learnerType != null && (learnerType.equalsIgnoreCase("Fast") || learnerType.equalsIgnoreCase("Slow"))) {
            quiz.setLearnerType(learnerType.substring(0, 1).toUpperCase() + learnerType.substring(1).toLowerCase());
        }

        UUID subjectId = parseUuid(body.get("subject_id"));
        if (subjectId != null && !subjectId.equals(quiz.getSubjectId())) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new NoSuchElementException("Subject not found with id: " + subjectId));
            validateTeacherSubjectAllocation(teacher.getTeacherId(), subjectId);
            quiz.setSubjectId(subjectId);
            quiz.setDepartmentId(subject.getDepartmentId());
            quiz.setSemesterId(subject.getSemesterId());
        }

        Quiz updated = quizRepository.save(quiz);
        Subject subject = subjectRepository.findById(updated.getSubjectId()).orElse(null);
        return mapQuizToMap(updated, subject);
    }

    @Transactional
    public Map<String, Object> publishTeacherQuiz(String identifier, UUID quizId) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        validateTeacherOwnership(teacher.getTeacherId(), quiz);

        long mcqCount = quizMcqRepository.countByQuizId(quizId);
        if (mcqCount == 0) {
            throw new IllegalArgumentException("Cannot publish a practice quiz without valid questions. Please add at least one MCQ.");
        }

        quiz.setIsPublished(true);
        quiz.setTotalQuestions((int) mcqCount);
        Quiz updated = quizRepository.save(quiz);
        Subject subject = subjectRepository.findById(updated.getSubjectId()).orElse(null);
        return mapQuizToMap(updated, subject);
    }

    @Transactional
    public Map<String, Object> archiveTeacherQuiz(String identifier, UUID quizId) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        validateTeacherOwnership(teacher.getTeacherId(), quiz);

        quiz.setIsArchived(true);
        quiz.setIsPublished(false);
        Quiz updated = quizRepository.save(quiz);
        Subject subject = subjectRepository.findById(updated.getSubjectId()).orElse(null);
        return mapQuizToMap(updated, subject);
    }

    @Transactional
    public void deleteTeacherQuiz(String identifier, UUID quizId) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        validateTeacherOwnership(teacher.getTeacherId(), quiz);

        quizMcqRepository.deleteByQuizId(quizId);
        quizRepository.delete(quiz);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQuizMcqs(String identifier, UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        List<QuizMcq> mcqs = quizMcqRepository.findByQuizIdOrderByMcqOrderAsc(quizId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (QuizMcq m : mcqs) {
            result.add(mapMcqToMap(m, true)); // include correct answer choice for teacher
        }
        return result;
    }

    @Transactional
    public Map<String, Object> addMcqToQuiz(String identifier, UUID quizId, Map<String, Object> body) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        validateTeacherOwnership(teacher.getTeacherId(), quiz);

        String question = parseString(body.get("question"));
        String optA = parseString(body.get("option_a"));
        String optB = parseString(body.get("option_b"));
        String optC = parseString(body.get("option_c"));
        String optD = parseString(body.get("option_d"));
        String correctAns = parseString(body.get("correct_answer"));
        String explanation = parseString(body.get("explanation"));

        if (question == null || question.trim().isEmpty()) {
            throw new IllegalArgumentException("Question text is required.");
        }
        if (optA == null || optA.trim().isEmpty() || optB == null || optB.trim().isEmpty() ||
                optC == null || optC.trim().isEmpty() || optD == null || optD.trim().isEmpty()) {
            throw new IllegalArgumentException("All four options (A, B, C, D) are required.");
        }
        if (correctAns == null || !Arrays.asList("A", "B", "C", "D").contains(correctAns.trim().toUpperCase())) {
            throw new IllegalArgumentException("Correct answer must be one of A, B, C, or D.");
        }

        int currentCount = (int) quizMcqRepository.countByQuizId(quizId);

        QuizMcq mcq = QuizMcq.builder()
                .quizId(quizId)
                .question(question.trim())
                .optionA(optA.trim())
                .optionB(optB.trim())
                .optionC(optC.trim())
                .optionD(optD.trim())
                .correctAnswer(correctAns.trim().toUpperCase())
                .explanation(explanation != null ? explanation.trim() : "")
                .mcqOrder(currentCount + 1)
                .build();

        QuizMcq saved = quizMcqRepository.save(mcq);

        quiz.setTotalQuestions(currentCount + 1);
        quizRepository.save(quiz);

        return mapMcqToMap(saved, true);
    }

    @Transactional
    public Map<String, Object> updateMcq(String identifier, UUID quizId, UUID mcqId, Map<String, Object> body) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        validateTeacherOwnership(teacher.getTeacherId(), quiz);

        QuizMcq mcq = quizMcqRepository.findByMcqIdAndQuizId(mcqId, quizId)
                .orElseThrow(() -> new NoSuchElementException("MCQ not found with id: " + mcqId));

        String question = parseString(body.get("question"));
        if (question != null && !question.trim().isEmpty()) mcq.setQuestion(question.trim());

        String optA = parseString(body.get("option_a"));
        if (optA != null && !optA.trim().isEmpty()) mcq.setOptionA(optA.trim());

        String optB = parseString(body.get("option_b"));
        if (optB != null && !optB.trim().isEmpty()) mcq.setOptionB(optB.trim());

        String optC = parseString(body.get("option_c"));
        if (optC != null && !optC.trim().isEmpty()) mcq.setOptionC(optC.trim());

        String optD = parseString(body.get("option_d"));
        if (optD != null && !optD.trim().isEmpty()) mcq.setOptionD(optD.trim());

        String correctAns = parseString(body.get("correct_answer"));
        if (correctAns != null && Arrays.asList("A", "B", "C", "D").contains(correctAns.trim().toUpperCase())) {
            mcq.setCorrectAnswer(correctAns.trim().toUpperCase());
        }

        String explanation = parseString(body.get("explanation"));
        if (explanation != null) mcq.setExplanation(explanation.trim());

        QuizMcq updated = quizMcqRepository.save(mcq);
        return mapMcqToMap(updated, true);
    }

    @Transactional
    public void deleteMcq(String identifier, UUID quizId, UUID mcqId) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + quizId));

        validateTeacherOwnership(teacher.getTeacherId(), quiz);

        QuizMcq mcq = quizMcqRepository.findByMcqIdAndQuizId(mcqId, quizId)
                .orElseThrow(() -> new NoSuchElementException("MCQ not found with id: " + mcqId));

        quizMcqRepository.delete(mcq);

        int remaining = (int) quizMcqRepository.countByQuizId(quizId);
        quiz.setTotalQuestions(remaining);
        if (remaining == 0) {
            quiz.setIsPublished(false);
        }
        quizRepository.save(quiz);
    }

    // ==========================================
    // STUDENT QUIZ & ATTEMPT WORKFLOW (STEP 13)
    // ==========================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentQuizzes(String identifier) {
        Student student = resolveStudentByIdentifier(identifier);
        List<Subject> studentSubjects = studentService.getSubjectsForStudent(student.getEnrollmentNo());
        if (studentSubjects.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> subjectIds = studentSubjects.stream().map(Subject::getSubjectId).collect(Collectors.toList());
        List<Quiz> publishedQuizzes = quizRepository.findBySubjectIdInAndIsPublishedTrueAndIsArchivedFalseOrderByCreatedAtDesc(subjectIds);

        Map<UUID, Subject> subjectMap = studentSubjects.stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Quiz q : publishedQuizzes) {
            Map<String, Object> qMap = mapQuizToMap(q, subjectMap.get(q.getSubjectId()));
            List<QuizMcq> mcqs = quizMcqRepository.findByQuizIdOrderByMcqOrderAsc(q.getQuizId());
            List<Map<String, Object>> mcqList = new ArrayList<>();
            for (QuizMcq m : mcqs) {
                // DO NOT expose correct_answer or explanation to student before submission!
                mcqList.add(mapMcqToMap(m, false));
            }
            qMap.put("mcqs", mcqList);
            result.add(qMap);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> startStudentAttempt(String identifier, UUID quizId) {
        Student student = resolveStudentByIdentifier(identifier);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NoSuchElementException("Practice quiz not found with id: " + quizId));

        if (!Boolean.TRUE.equals(quiz.getIsPublished()) || Boolean.TRUE.equals(quiz.getIsArchived())) {
            throw new AccessDeniedException("Practice quiz is not available for attempts.");
        }

        validateStudentCohortScope(student, quiz);

        Optional<QuizAttempt> inProgressOpt = quizAttemptRepository
                .findFirstByStudentIdAndQuizIdAndStatusOrderByAttemptNumberDesc(student.getStudentId(), quizId, "IN_PROGRESS");

        QuizAttempt attempt;
        if (inProgressOpt.isPresent()) {
            attempt = inProgressOpt.get();
        } else {
            long previousAttemptsCount = quizAttemptRepository.countByStudentIdAndQuizId(student.getStudentId(), quizId);
            attempt = QuizAttempt.builder()
                    .quizId(quizId)
                    .studentId(student.getStudentId())
                    .attemptNumber((int) previousAttemptsCount + 1)
                    .status("IN_PROGRESS")
                    .score(0)
                    .totalQuestions(quiz.getTotalQuestions() != null ? quiz.getTotalQuestions() : 0)
                    .correctCount(0)
                    .percentage(BigDecimal.ZERO)
                    .build();
            attempt = quizAttemptRepository.save(attempt);
        }

        List<QuizAttemptAnswer> existingAnswers = quizAttemptAnswerRepository.findByAttemptId(attempt.getAttemptId());
        Map<String, String> userAnswersMap = new HashMap<>();
        for (QuizAttemptAnswer ans : existingAnswers) {
            userAnswersMap.put(ans.getMcqId().toString(), ans.getSelectedOption());
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("attempt_id", attempt.getAttemptId().toString());
        resp.put("quiz_id", quizId.toString());
        resp.put("attempt_number", attempt.getAttemptNumber());
        resp.put("status", attempt.getStatus());
        resp.put("user_answers", userAnswersMap);
        return resp;
    }

    @Transactional
    public Map<String, Object> saveStudentAttemptAnswers(String identifier, UUID quizId, UUID attemptId, Map<String, Object> body) {
        Student student = resolveStudentByIdentifier(identifier);
        QuizAttempt attempt = quizAttemptRepository.findByAttemptIdAndStudentId(attemptId, student.getStudentId())
                .orElseThrow(() -> new NoSuchElementException("Attempt not found or not owned by student."));

        if ("COMPLETED".equalsIgnoreCase(attempt.getStatus())) {
            return getCompletedAttemptResult(attempt);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> userAnswersRaw = (Map<String, Object>) body.get("answers");
        if (userAnswersRaw != null) {
            for (Map.Entry<String, Object> entry : userAnswersRaw.entrySet()) {
                UUID mcqId = parseUuid(entry.getKey());
                String option = parseString(entry.getValue());
                if (mcqId != null && option != null && Arrays.asList("A", "B", "C", "D").contains(option.toUpperCase())) {
                    QuizAttemptAnswer ans = quizAttemptAnswerRepository.findByAttemptIdAndMcqId(attemptId, mcqId)
                            .orElseGet(() -> QuizAttemptAnswer.builder().attemptId(attemptId).mcqId(mcqId).build());
                    ans.setSelectedOption(option.toUpperCase());
                    quizAttemptAnswerRepository.save(ans);
                }
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("attempt_id", attemptId.toString());
        resp.put("status", attempt.getStatus());
        resp.put("message", "Answers saved in progress.");
        return resp;
    }

    @Transactional
    public Map<String, Object> submitStudentAttempt(String identifier, UUID quizId, UUID attemptId, Map<String, Object> body) {
        Student student = resolveStudentByIdentifier(identifier);
        QuizAttempt attempt = quizAttemptRepository.findByAttemptIdAndStudentId(attemptId, student.getStudentId())
                .orElseThrow(() -> new NoSuchElementException("Attempt not found or not owned by student."));

        // Idempotent: If attempt is already completed, return existing server calculated result cleanly
        if ("COMPLETED".equalsIgnoreCase(attempt.getStatus())) {
            return getCompletedAttemptResult(attempt);
        }

        List<QuizMcq> mcqs = quizMcqRepository.findByQuizIdOrderByMcqOrderAsc(quizId);
        if (mcqs.isEmpty()) {
            throw new IllegalArgumentException("Quiz contains no questions to evaluate.");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> userAnswersRaw = (Map<String, Object>) body.get("answers");
        Map<String, String> submittedAnswers = new HashMap<>();
        if (userAnswersRaw != null) {
            for (Map.Entry<String, Object> entry : userAnswersRaw.entrySet()) {
                String val = parseString(entry.getValue());
                if (val != null) {
                    submittedAnswers.put(entry.getKey(), val.toUpperCase());
                }
            }
        }

        int correctCount = 0;
        int totalQuestions = mcqs.size();
        List<Map<String, Object>> evaluatedMcqs = new ArrayList<>();

        for (QuizMcq mcq : mcqs) {
            String mcqIdStr = mcq.getMcqId().toString();
            String selected = submittedAnswers.get(mcqIdStr);

            // If not in body, check previously saved answer
            if (selected == null) {
                Optional<QuizAttemptAnswer> prevOpt = quizAttemptAnswerRepository.findByAttemptIdAndMcqId(attemptId, mcq.getMcqId());
                if (prevOpt.isPresent()) {
                    selected = prevOpt.get().getSelectedOption();
                }
            }

            boolean isCorrect = selected != null && selected.equalsIgnoreCase(mcq.getCorrectAnswer());
            if (isCorrect) {
                correctCount++;
            }

            QuizAttemptAnswer ans = quizAttemptAnswerRepository.findByAttemptIdAndMcqId(attemptId, mcq.getMcqId())
                    .orElseGet(() -> QuizAttemptAnswer.builder().attemptId(attemptId).mcqId(mcq.getMcqId()).build());

            ans.setSelectedOption(selected);
            ans.setIsCorrect(isCorrect);
            ans.setQuestionSnapshot(mcq.getQuestion());
            ans.setCorrectOptionSnapshot(mcq.getCorrectAnswer());
            ans.setExplanationSnapshot(mcq.getExplanation() != null ? mcq.getExplanation() : "");
            quizAttemptAnswerRepository.save(ans);

            Map<String, Object> evalMap = new HashMap<>();
            evalMap.put("mcq_id", mcqIdStr);
            evalMap.put("question", mcq.getQuestion());
            evalMap.put("option_a", mcq.getOptionA());
            evalMap.put("option_b", mcq.getOptionB());
            evalMap.put("option_c", mcq.getOptionC());
            evalMap.put("option_d", mcq.getOptionD());
            evalMap.put("selected_option", selected);
            evalMap.put("correct_answer", mcq.getCorrectAnswer());
            evalMap.put("is_correct", isCorrect);
            evalMap.put("explanation", mcq.getExplanation() != null ? mcq.getExplanation() : "");
            evaluatedMcqs.add(evalMap);
        }

        BigDecimal percentage = BigDecimal.valueOf(correctCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP);

        attempt.setCorrectCount(correctCount);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setScore(correctCount * 10); // 10 points per correct answer
        attempt.setPercentage(percentage);
        attempt.setStatus("COMPLETED");
        attempt.setCompletedAt(LocalDateTime.now());
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        Map<String, Object> resp = new HashMap<>();
        resp.put("attempt_id", savedAttempt.getAttemptId().toString());
        resp.put("quiz_id", quizId.toString());
        resp.put("attempt_number", savedAttempt.getAttemptNumber());
        resp.put("status", savedAttempt.getStatus());
        resp.put("score", savedAttempt.getScore());
        resp.put("correct_count", savedAttempt.getCorrectCount());
        resp.put("total_questions", savedAttempt.getTotalQuestions());
        resp.put("percentage", savedAttempt.getPercentage());
        resp.put("completed_at", savedAttempt.getCompletedAt().toString());
        resp.put("mcqs", evaluatedMcqs);
        return resp;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAttemptHistory(String identifier, UUID quizId) {
        Student student = resolveStudentByIdentifier(identifier);
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdAndQuizIdOrderByAttemptNumberDesc(student.getStudentId(), quizId);

        List<Map<String, Object>> list = new ArrayList<>();
        for (QuizAttempt a : attempts) {
            Map<String, Object> map = new HashMap<>();
            map.put("attempt_id", a.getAttemptId().toString());
            map.put("quiz_id", a.getQuizId().toString());
            map.put("attempt_number", a.getAttemptNumber());
            map.put("status", a.getStatus());
            map.put("score", a.getScore());
            map.put("correct_count", a.getCorrectCount());
            map.put("total_questions", a.getTotalQuestions());
            map.put("percentage", a.getPercentage());
            map.put("started_at", a.getStartedAt() != null ? a.getStartedAt().toString() : "");
            map.put("completed_at", a.getCompletedAt() != null ? a.getCompletedAt().toString() : "");
            list.add(map);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAttemptDetail(String identifier, UUID attemptId) {
        Student student = resolveStudentByIdentifier(identifier);
        QuizAttempt attempt = quizAttemptRepository.findByAttemptIdAndStudentId(attemptId, student.getStudentId())
                .orElseThrow(() -> new NoSuchElementException("Attempt not found or access denied."));

        return getCompletedAttemptResult(attempt);
    }

    private Map<String, Object> getCompletedAttemptResult(QuizAttempt attempt) {
        List<QuizAttemptAnswer> answers = quizAttemptAnswerRepository.findByAttemptId(attempt.getAttemptId());
        List<Map<String, Object>> evaluatedMcqs = new ArrayList<>();

        for (QuizAttemptAnswer ans : answers) {
            Map<String, Object> evalMap = new HashMap<>();
            evalMap.put("mcq_id", ans.getMcqId().toString());
            evalMap.put("question", ans.getQuestionSnapshot());
            evalMap.put("selected_option", ans.getSelectedOption());
            evalMap.put("correct_answer", ans.getCorrectOptionSnapshot());
            evalMap.put("is_correct", Boolean.TRUE.equals(ans.getIsCorrect()));
            evalMap.put("explanation", ans.getExplanationSnapshot() != null ? ans.getExplanationSnapshot() : "");
            evaluatedMcqs.add(evalMap);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("attempt_id", attempt.getAttemptId().toString());
        resp.put("quiz_id", attempt.getQuizId().toString());
        resp.put("attempt_number", attempt.getAttemptNumber());
        resp.put("status", attempt.getStatus());
        resp.put("score", attempt.getScore());
        resp.put("correct_count", attempt.getCorrectCount());
        resp.put("total_questions", attempt.getTotalQuestions());
        resp.put("percentage", attempt.getPercentage());
        resp.put("completed_at", attempt.getCompletedAt() != null ? attempt.getCompletedAt().toString() : "");
        resp.put("mcqs", evaluatedMcqs);
        return resp;
    }

    private Teacher resolveTeacherByIdentifier(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Teacher> opt = teacherRepository.findByEmail(cleanId);
        if (opt.isPresent()) return opt.get();
        opt = teacherRepository.findByEmployeeId(cleanId);
        if (opt.isPresent()) return opt.get();
        try {
            return teacherRepository.findById(UUID.fromString(cleanId))
                    .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + cleanId));
        } catch (Exception e) {
            throw new NoSuchElementException("Teacher record not found for: " + cleanId);
        }
    }

    private Student resolveStudentByIdentifier(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Student> opt = studentRepository.findByEnrollmentNo(cleanId);
        if (opt.isPresent()) return opt.get();
        opt = studentRepository.findByEmail(cleanId);
        if (opt.isPresent()) return opt.get();
        try {
            return studentRepository.findById(UUID.fromString(cleanId))
                    .orElseThrow(() -> new NoSuchElementException("Student record not found for: " + cleanId));
        } catch (Exception e) {
            throw new NoSuchElementException("Student record not found for: " + cleanId);
        }
    }

    private void validateTeacherOwnership(UUID teacherId, Quiz quiz) {
        if (!SecurityUtils.isAdmin() && !teacherId.equals(quiz.getTeacherId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to modify this practice quiz.");
        }
    }

    private void validateTeacherSubjectAllocation(UUID teacherId, UUID subjectId) {
        if (SecurityUtils.isAdmin()) return;
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacherId);
        boolean isAllocated = allocations.stream().anyMatch(a -> Objects.equals(a.getSubjectId(), subjectId));
        if (!isAllocated) {
            throw new AccessDeniedException("Access denied: Subject is not allocated to the authenticated teacher.");
        }
    }

    private void validateStudentCohortScope(Student student, Quiz quiz) {
        if (quiz.getDepartmentId() != null && student.getDepartmentId() != null &&
                !quiz.getDepartmentId().equals(student.getDepartmentId())) {
            throw new AccessDeniedException("Practice quiz is out of scope for student department.");
        }
        if (quiz.getSemesterId() != null && student.getSemesterId() != null &&
                !quiz.getSemesterId().equals(student.getSemesterId())) {
            throw new AccessDeniedException("Practice quiz is out of scope for student semester.");
        }
    }

    private Map<String, Object> mapQuizToMap(Quiz q, Subject s) {
        Map<String, Object> map = new HashMap<>();
        String quizIdStr = q.getQuizId().toString();
        map.put("quiz_id", quizIdStr);
        map.put("id", quizIdStr);
        map.put("subject_id", q.getSubjectId() != null ? q.getSubjectId().toString() : "");
        map.put("subject_code", s != null && s.getSubjectCode() != null ? s.getSubjectCode() : "");
        map.put("subject_name", s != null && s.getSubjectName() != null ? s.getSubjectName() : "");
        map.put("title", q.getTitle());
        map.put("description", q.getDescription() != null ? q.getDescription() : "");
        map.put("learner_type", q.getLearnerType() != null ? q.getLearnerType() : "Fast");
        map.put("total_questions", q.getTotalQuestions() != null ? q.getTotalQuestions() : 0);
        map.put("is_published", Boolean.TRUE.equals(q.getIsPublished()));
        map.put("is_archived", Boolean.TRUE.equals(q.getIsArchived()));
        map.put("created_at", q.getCreatedAt() != null ? q.getCreatedAt().toString() : "");
        map.put("updated_at", q.getUpdatedAt() != null ? q.getUpdatedAt().toString() : "");
        return map;
    }

    private Map<String, Object> mapMcqToMap(QuizMcq m, boolean includeAnswerKey) {
        Map<String, Object> map = new HashMap<>();
        String mcqIdStr = m.getMcqId().toString();
        map.put("mcq_id", mcqIdStr);
        map.put("id", mcqIdStr);
        map.put("quiz_id", m.getQuizId().toString());
        map.put("question", m.getQuestion());
        map.put("option_a", m.getOptionA());
        map.put("option_b", m.getOptionB());
        map.put("option_c", m.getOptionC());
        map.put("option_d", m.getOptionD());
        map.put("mcq_order", m.getMcqOrder() != null ? m.getMcqOrder() : 1);
        map.put("created_at", m.getCreatedAt() != null ? m.getCreatedAt().toString() : "");

        if (includeAnswerKey) {
            map.put("correct_answer", m.getCorrectAnswer());
            map.put("explanation", m.getExplanation() != null ? m.getExplanation() : "");
        } else {
            map.put("correct_answer", null);
            map.put("explanation", null);
        }
        return map;
    }

    private String parseString(Object obj) {
        if (obj == null) return null;
        String s = String.valueOf(obj);
        return s.trim().isEmpty() ? null : s.trim();
    }

    private UUID parseUuid(Object obj) {
        if (obj == null) return null;
        String str = String.valueOf(obj).trim();
        if (str.isEmpty()) return null;
        try {
            return UUID.fromString(str);
        } catch (Exception e) {
            return null;
        }
    }
}
