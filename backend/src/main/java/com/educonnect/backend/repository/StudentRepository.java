package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByEnrollmentNo(String enrollmentNo);
    Optional<Student> findByEnrollmentNoIgnoreCase(String enrollmentNo);
    boolean existsByEnrollmentNo(String enrollmentNo);
    Optional<Student> findByEmail(String email);
}
