package com.educonnect.backend.repository;

import com.educonnect.backend.entity.TeacherSubjectAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherSubjectAllocationRepository extends JpaRepository<TeacherSubjectAllocation, UUID> {
    List<TeacherSubjectAllocation> findByTeacher_TeacherId(UUID teacherId);
    List<TeacherSubjectAllocation> findByTeacher_Email(String email);
    List<TeacherSubjectAllocation> findBySubject_SubjectId(UUID subjectId);
    List<TeacherSubjectAllocation> findByProgram_ProgramId(UUID programId);
    
    boolean existsByTeacher_TeacherIdAndSubject_SubjectIdAndProgram_ProgramIdAndSemester_SemesterId(
            UUID teacherId, UUID subjectId, UUID programId, UUID semesterId);
}
