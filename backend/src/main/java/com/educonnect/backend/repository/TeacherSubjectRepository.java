package com.educonnect.backend.repository;

import com.educonnect.backend.entity.TeacherSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherSubjectRepository extends JpaRepository<TeacherSubject, UUID> {
    List<TeacherSubject> findByTeacherId(UUID teacherId);
    List<TeacherSubject> findBySubjectId(UUID subjectId);
    Optional<TeacherSubject> findByTeacherIdAndSubjectId(UUID teacherId, UUID subjectId);

    @Modifying
    @Transactional
    void deleteByTeacherIdAndSubjectId(UUID teacherId, UUID subjectId);
}
