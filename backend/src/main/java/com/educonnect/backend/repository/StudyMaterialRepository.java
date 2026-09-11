package com.educonnect.backend.repository;

import com.educonnect.backend.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, UUID> {
    List<StudyMaterial> findByTeacherIdAndIsActiveTrue(UUID teacherId);
    List<StudyMaterial> findByIsActiveTrue();
    List<StudyMaterial> findBySubjectIdInAndIsActiveTrue(List<UUID> subjectIds);
}
