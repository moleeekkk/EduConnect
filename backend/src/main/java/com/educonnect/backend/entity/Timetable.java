package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "timetables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "timetable_id")
    @JsonProperty("timetable_id")
    private UUID timetableId;

    @Column(name = "allocation_id")
    @JsonProperty("allocation_id")
    private UUID allocationId;

    @Column(name = "teacher_id", nullable = false)
    @JsonProperty("teacher_id")
    private UUID teacherId;

    @Column(name = "subject_id", nullable = false)
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "batch_id", nullable = false)
    @JsonProperty("batch_id")
    private UUID batchId;

    @Column(name = "semester_id", nullable = false)
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "department_id", nullable = false)
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "weekday", nullable = false, length = 20)
    @JsonProperty("weekday")
    private String weekday;

    @Column(name = "start_time", nullable = false)
    @JsonProperty("start_time")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    @JsonProperty("end_time")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    @Column(name = "room", nullable = false, length = 50)
    @JsonProperty("room")
    private String room;

    @Column(name = "effective_from", nullable = false)
    @JsonProperty("effective_from")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to", nullable = false)
    @JsonProperty("effective_to")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveTo;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    @JsonProperty("is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonProperty("id")
    public UUID getId() {
        return timetableId;
    }

    @PrePersist
    protected void onCreate() {
        if (isActive == null) {
            isActive = true;
        }
        if (effectiveFrom == null) {
            effectiveFrom = LocalDate.now();
        }
        if (effectiveTo == null) {
            effectiveTo = LocalDate.of(2099, 12, 31);
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
