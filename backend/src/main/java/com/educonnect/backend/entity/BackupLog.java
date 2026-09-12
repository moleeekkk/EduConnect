package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "backup_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "backup_id")
    @JsonProperty("backup_id")
    private UUID backupId;

    @Column(name = "filename", nullable = false)
    @JsonProperty("filename")
    private String filename;

    @Column(name = "backup_type", nullable = false, length = 50)
    @JsonProperty("backup_type")
    private String backupType; // DB_DUMP, UPLOADS_ZIP

    @Column(name = "file_size", nullable = false)
    @JsonProperty("file_size")
    private Long fileSize;

    @Column(name = "status", nullable = false, length = 50)
    @JsonProperty("status")
    private String status; // SUCCESS, FAILED, UNAVAILABLE

    @Column(name = "error_message", columnDefinition = "TEXT")
    @JsonProperty("error_message")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    @JsonProperty("created_by")
    private String createdBy;

    @JsonProperty("id")
    public UUID getId() {
        return backupId;
    }

    @PrePersist
    protected void onCreate() {
        if (fileSize == null) fileSize = 0L;
        if (status == null) status = "SUCCESS";
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
