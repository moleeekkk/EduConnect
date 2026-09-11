package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByTeacherSubjectIdIn(Collection<UUID> teacherSubjectIds);
    List<Assignment> findByTeacherSubjectId(UUID teacherSubjectId);
    List<Assignment> findBySubjectIdIn(Collection<UUID> subjectIds);
    List<Assignment> findBySubjectId(UUID subjectId);
}
