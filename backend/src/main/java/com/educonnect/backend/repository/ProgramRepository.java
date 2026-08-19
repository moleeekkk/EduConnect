package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgramRepository extends JpaRepository<Program, UUID> {
    Optional<Program> findByProgramCode(String programCode);
    List<Program> findByInstitute_InstituteId(UUID instituteId);
}
