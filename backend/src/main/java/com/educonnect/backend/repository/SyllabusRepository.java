package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, UUID> {
    Optional<Syllabus> findBySubjectId(UUID subjectId);
    List<Syllabus> findBySubjectIdIn(Collection<UUID> subjectIds);
}
