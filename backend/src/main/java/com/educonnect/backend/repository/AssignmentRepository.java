package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByTeacherSubjectId(UUID teacherSubjectId);
    List<Assignment> findByTeacherSubjectIdIn(List<UUID> teacherSubjectIds);
}
