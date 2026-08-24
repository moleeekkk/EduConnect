package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByEnrollmentNo(String enrollmentNo);
    Optional<Student> findByEmail(String email);
    boolean existsByEnrollmentNo(String enrollmentNo);
    boolean existsByEmail(String email);
    
    long countByProgram_ProgramIdAndSemester_SemesterId(UUID programId, UUID semesterId);
    List<Student> findByProgram_ProgramIdAndSemester_SemesterId(UUID programId, UUID semesterId);
}
