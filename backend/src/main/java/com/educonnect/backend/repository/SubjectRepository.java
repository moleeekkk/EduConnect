package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    Optional<Subject> findBySubjectCode(String subjectCode);
}
