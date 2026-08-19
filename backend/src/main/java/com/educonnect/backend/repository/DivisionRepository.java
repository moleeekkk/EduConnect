package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DivisionRepository extends JpaRepository<Division, UUID> {
    List<Division> findByProgram_ProgramId(UUID programId);
}
