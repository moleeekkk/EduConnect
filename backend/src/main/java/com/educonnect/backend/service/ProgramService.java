package com.educonnect.backend.service;

import com.educonnect.backend.entity.Program;
import com.educonnect.backend.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;

    @Transactional(readOnly = true)
    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Program> getProgramById(UUID id) {
        return programRepository.findById(id);
    }

    @Transactional
    public Program createProgram(Program program) {
        program.setProgramId(null);
        if (program.getIsActive() == null) {
            program.setIsActive(true);
        }
        if (program.getProgramCode() == null || program.getProgramCode().trim().isEmpty()) {
            program.setProgramCode("PROG-" + (System.currentTimeMillis() % 10000));
        }
        if (program.getProgramName() == null || program.getProgramName().trim().isEmpty()) {
            program.setProgramName("Academic Program");
        }
        return programRepository.save(program);
    }

    @Transactional
    public Program updateProgram(UUID id, Program updated) {
        return programRepository.findById(id).map(existing -> {
            if (updated.getProgramCode() != null) existing.setProgramCode(updated.getProgramCode());
            if (updated.getProgramName() != null) existing.setProgramName(updated.getProgramName());
            if (updated.getDepartmentId() != null) existing.setDepartmentId(updated.getDepartmentId());
            if (updated.getInstituteId() != null) existing.setInstituteId(updated.getInstituteId());
            if (updated.getDegreeType() != null) existing.setDegreeType(updated.getDegreeType());
            if (updated.getTotalSemesters() != null) existing.setTotalSemesters(updated.getTotalSemesters());
            if (updated.getDurationYears() != null) existing.setDurationYears(updated.getDurationYears());
            if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
            if (updated.getIsActive() != null) existing.setIsActive(updated.getIsActive());
            existing.setUpdatedAt(java.time.LocalDateTime.now());
            return programRepository.save(existing);
        }).orElseGet(() -> {
            updated.setProgramId(id);
            return programRepository.save(updated);
        });
    }

    @Transactional
    public void deleteProgram(UUID id) {
        programRepository.deleteById(id);
    }
}
