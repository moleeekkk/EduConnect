package com.educonnect.backend.repository;

import com.educonnect.backend.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, UUID> {
    List<ExamResult> findByStudentId(UUID studentId);
    List<ExamResult> findByTeacherSubjectId(UUID teacherSubjectId);
    List<ExamResult> findByTeacherSubjectIdIn(List<UUID> teacherSubjectIds);
    Optional<ExamResult> findByTeacherSubjectIdAndStudentIdAndExamName(UUID teacherSubjectId, UUID studentId, String examName);
}
