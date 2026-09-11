package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, UUID> {

    List<Timetable> findByIsActiveTrueOrderByStartTimeAsc();

    List<Timetable> findByTeacherIdAndIsActiveTrueOrderByStartTimeAsc(UUID teacherId);

    List<Timetable> findByBatchIdAndSemesterIdAndIsActiveTrueOrderByStartTimeAsc(UUID batchId, UUID semesterId);

    List<Timetable> findByBatchIdAndSemesterIdAndDepartmentIdAndIsActiveTrueOrderByStartTimeAsc(UUID batchId, UUID semesterId, UUID departmentId);

    List<Timetable> findAllByOrderByCreatedAtDesc();

    @Query("SELECT t FROM Timetable t WHERE t.isActive = true AND t.teacherId = :teacherId " +
            "AND UPPER(t.weekday) = UPPER(:weekday) " +
            "AND (t.startTime < :endTime AND t.endTime > :startTime) " +
            "AND (t.effectiveFrom <= :effectiveTo AND t.effectiveTo >= :effectiveFrom) " +
            "AND (:excludeId IS NULL OR t.timetableId <> :excludeId)")
    List<Timetable> findTeacherConflicts(
            @Param("teacherId") UUID teacherId,
            @Param("weekday") String weekday,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("effectiveFrom") LocalDate effectiveFrom,
            @Param("effectiveTo") LocalDate effectiveTo,
            @Param("excludeId") UUID excludeId
    );

    @Query("SELECT t FROM Timetable t WHERE t.isActive = true AND LOWER(t.room) = LOWER(:room) " +
            "AND UPPER(t.weekday) = UPPER(:weekday) " +
            "AND (t.startTime < :endTime AND t.endTime > :startTime) " +
            "AND (t.effectiveFrom <= :effectiveTo AND t.effectiveTo >= :effectiveFrom) " +
            "AND (:excludeId IS NULL OR t.timetableId <> :excludeId)")
    List<Timetable> findRoomConflicts(
            @Param("room") String room,
            @Param("weekday") String weekday,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("effectiveFrom") LocalDate effectiveFrom,
            @Param("effectiveTo") LocalDate effectiveTo,
            @Param("excludeId") UUID excludeId
    );

    @Query("SELECT t FROM Timetable t WHERE t.isActive = true AND t.batchId = :batchId AND t.semesterId = :semesterId " +
            "AND UPPER(t.weekday) = UPPER(:weekday) " +
            "AND (t.startTime < :endTime AND t.endTime > :startTime) " +
            "AND (t.effectiveFrom <= :effectiveTo AND t.effectiveTo >= :effectiveFrom) " +
            "AND (:excludeId IS NULL OR t.timetableId <> :excludeId)")
    List<Timetable> findCohortConflicts(
            @Param("batchId") UUID batchId,
            @Param("semesterId") UUID semesterId,
            @Param("weekday") String weekday,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("effectiveFrom") LocalDate effectiveFrom,
            @Param("effectiveTo") LocalDate effectiveTo,
            @Param("excludeId") UUID excludeId
    );
}
