package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    List<Semester> findByProgram_ProgramId(UUID programId);
}
