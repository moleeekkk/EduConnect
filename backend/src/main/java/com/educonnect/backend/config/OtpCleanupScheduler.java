package com.educonnect.backend.config;

import com.educonnect.backend.repository.StudentOtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OtpCleanupScheduler {

    private final StudentOtpRepository studentOtpRepository;

    /**
     * Runs every hour to clean up expired or used Student OTP records from PostgreSQL.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            LocalDateTime now = LocalDateTime.now();
            studentOtpRepository.deleteByExpiresAtBeforeOrUsedTrue(now);
            log.info("Completed automated cleanup of expired/used Student OTP records at {}", now);
        } catch (Exception e) {
            log.error("Failed to execute Student OTP automated cleanup task: {}", e.getMessage());
        }
    }
}
