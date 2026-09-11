package com.educonnect.backend.repository;

import com.educonnect.backend.entity.QuizAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswer, UUID> {

    List<QuizAttemptAnswer> findByAttemptId(UUID attemptId);

    Optional<QuizAttemptAnswer> findByAttemptIdAndMcqId(UUID attemptId, UUID mcqId);

    void deleteByAttemptId(UUID attemptId);
}
