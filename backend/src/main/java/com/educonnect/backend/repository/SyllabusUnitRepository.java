package com.educonnect.backend.repository;

import com.educonnect.backend.entity.SyllabusUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SyllabusUnitRepository extends JpaRepository<SyllabusUnit, UUID> {
    List<SyllabusUnit> findBySyllabusIdOrderByUnitNumberAsc(UUID syllabusId);
    void deleteBySyllabusId(UUID syllabusId);
}
