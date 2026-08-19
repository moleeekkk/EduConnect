package com.educonnect.backend.repository;

import com.educonnect.backend.entity.StudentOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentOtpRepository extends JpaRepository<StudentOtp, UUID> {

    Optional<StudentOtp> findTopByEnrollmentNoAndPurposeAndUsedFalseOrderByCreatedAtDesc(String enrollmentNo, String purpose);

    Optional<StudentOtp> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(String email, String purpose);

    void deleteByExpiresAtBeforeOrUsedTrue(LocalDateTime now);
}
