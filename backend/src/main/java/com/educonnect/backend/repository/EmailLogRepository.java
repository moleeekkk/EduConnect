package com.educonnect.backend.repository;

import com.educonnect.backend.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {

    List<EmailLog> findBySenderId(UUID senderId);

    List<EmailLog> findByStudentId(UUID studentId);

    Optional<EmailLog> findByIdempotencyKey(String idempotencyKey);
}
