package com.educonnect.backend.repository;

import com.educonnect.backend.entity.StudentDoubt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentDoubtRepository extends JpaRepository<StudentDoubt, UUID> {
    List<StudentDoubt> findByStudentId(UUID studentId);
    List<StudentDoubt> findByEnrollmentNo(String enrollmentNo);
}
