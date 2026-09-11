package com.educonnect.backend.repository;

import com.educonnect.backend.entity.SemesterResultDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterResultDetailRepository extends JpaRepository<SemesterResultDetail, UUID> {

    List<SemesterResultDetail> findByResultId(UUID resultId);

    List<SemesterResultDetail> findByResultIdAndIsPublishedTrue(UUID resultId);

    List<SemesterResultDetail> findByStudentIdAndSemesterId(UUID studentId, UUID semesterId);

    List<SemesterResultDetail> findByStudentIdAndSemesterIdAndIsPublishedTrue(UUID studentId, UUID semesterId);

    Optional<SemesterResultDetail> findByStudentIdAndSubjectIdAndSemesterId(UUID studentId, UUID subjectId, UUID semesterId);

    List<SemesterResultDetail> findBySubjectIdAndSemesterId(UUID subjectId, UUID semesterId);
}
