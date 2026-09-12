package com.educonnect.backend.repository;

import com.educonnect.backend.entity.BackupLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BackupLogRepository extends JpaRepository<BackupLog, UUID> {
    List<BackupLog> findAllByOrderByCreatedAtDesc();
    Optional<BackupLog> findByFilename(String filename);
}
