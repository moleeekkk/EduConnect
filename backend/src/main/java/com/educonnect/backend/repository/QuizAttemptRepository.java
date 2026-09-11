package com.educonnect.backend.repository;

import com.educonnect.backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {

    List<QuizAttempt> findByStudentIdAndQuizIdOrderByAttemptNumberDesc(UUID studentId, UUID quizId);

    Optional<QuizAttempt> findFirstByStudentIdAndQuizIdAndStatusOrderByAttemptNumberDesc(UUID studentId, UUID quizId, String status);

    Optional<QuizAttempt> findByAttemptIdAndStudentId(UUID attemptId, UUID studentId);

    long countByStudentIdAndQuizId(UUID studentId, UUID quizId);
}
