package com.educonnect.backend.repository;

import com.educonnect.backend.entity.QuizMcq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizMcqRepository extends JpaRepository<QuizMcq, UUID> {

    List<QuizMcq> findByQuizIdOrderByMcqOrderAsc(UUID quizId);

    Optional<QuizMcq> findByMcqIdAndQuizId(UUID mcqId, UUID quizId);

    long countByQuizId(UUID quizId);

    void deleteByQuizId(UUID quizId);
}
