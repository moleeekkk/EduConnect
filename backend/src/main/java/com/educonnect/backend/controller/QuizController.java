package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/teacher/quizzes")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherQuizzes(Authentication authentication) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.getTeacherQuizzes(identifier));
    }

    @PostMapping("/teacher/quizzes")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> createTeacherQuiz(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.createTeacherQuiz(identifier, body));
    }

    @PutMapping("/teacher/quizzes/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> updateTeacherQuiz(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.updateTeacherQuiz(identifier, id, body));
    }

    @PostMapping("/teacher/quizzes/{id}/publish")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> publishTeacherQuiz(
            Authentication authentication,
            @PathVariable UUID id) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.publishTeacherQuiz(identifier, id));
    }

    @PostMapping("/teacher/quizzes/{id}/archive")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> archiveTeacherQuiz(
            Authentication authentication,
            @PathVariable UUID id) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.archiveTeacherQuiz(identifier, id));
    }

    @DeleteMapping("/teacher/quizzes/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> deleteTeacherQuiz(
            Authentication authentication,
            @PathVariable UUID id) {
        String identifier = getAuthenticatedIdentifier(authentication);
        quizService.deleteTeacherQuiz(identifier, id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully"));
    }

    @GetMapping("/teacher/quizzes/{id}/mcqs")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getQuizMcqs(
            Authentication authentication,
            @PathVariable UUID id) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.getQuizMcqs(identifier, id));
    }

    @PostMapping("/teacher/quizzes/{id}/mcqs")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> addMcqToQuiz(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.addMcqToQuiz(identifier, id, body));
    }

    @PutMapping("/teacher/quizzes/{id}/mcqs/{mcqId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> updateMcq(
            Authentication authentication,
            @PathVariable UUID id,
            @PathVariable UUID mcqId,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.updateMcq(identifier, id, mcqId, body));
    }

    @DeleteMapping("/teacher/quizzes/{id}/mcqs/{mcqId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> deleteMcq(
            Authentication authentication,
            @PathVariable UUID id,
            @PathVariable UUID mcqId) {
        String identifier = getAuthenticatedIdentifier(authentication);
        quizService.deleteMcq(identifier, id, mcqId);
        return ResponseEntity.ok(Map.of("message", "MCQ question deleted successfully"));
    }

    @GetMapping("/student/quizzes")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentQuizzes(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String identifier = enrollmentNo != null && !enrollmentNo.trim().isEmpty()
                ? enrollmentNo
                : getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.getStudentQuizzes(identifier));
    }

    @PostMapping("/student/quizzes/{quizId}/attempts/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> startStudentAttempt(
            Authentication authentication,
            @PathVariable UUID quizId) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.startStudentAttempt(identifier, quizId));
    }

    @PostMapping("/student/quizzes/{quizId}/attempts/{attemptId}/save")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> saveStudentAttemptAnswers(
            Authentication authentication,
            @PathVariable UUID quizId,
            @PathVariable UUID attemptId,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.saveStudentAttemptAnswers(identifier, quizId, attemptId, body));
    }

    @PostMapping("/student/quizzes/{quizId}/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitStudentAttempt(
            Authentication authentication,
            @PathVariable UUID quizId,
            @PathVariable UUID attemptId,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.submitStudentAttempt(identifier, quizId, attemptId, body));
    }

    @GetMapping("/student/quizzes/{quizId}/attempts/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttemptHistory(
            Authentication authentication,
            @PathVariable UUID quizId) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.getStudentAttemptHistory(identifier, quizId));
    }

    @GetMapping("/student/attempts/{attemptId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getStudentAttemptDetail(
            Authentication authentication,
            @PathVariable UUID attemptId) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(quizService.getStudentAttemptDetail(identifier, attemptId));
    }

    private String getAuthenticatedIdentifier(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().isEmpty()) {
            return authentication.getName();
        }
        return SecurityUtils.getCurrentUserIdentifier();
    }
}
