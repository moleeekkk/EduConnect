package com.educonnect.backend.repository;

import com.educonnect.backend.entity.SemesterResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterResultRepository extends JpaRepository<SemesterResult, UUID> {

    Optional<SemesterResult> findByStudentIdAndSemesterId(UUID studentId, UUID semesterId);

    Optional<SemesterResult> findByStudentIdAndSemesterIdAndIsPublishedTrue(UUID studentId, UUID semesterId);

    List<SemesterResult> findByStudentId(UUID studentId);

    List<SemesterResult> findByStudentIdAndIsPublishedTrue(UUID studentId);

    List<SemesterResult> findByDepartmentIdAndSemesterId(UUID departmentId, UUID semesterId);
}
