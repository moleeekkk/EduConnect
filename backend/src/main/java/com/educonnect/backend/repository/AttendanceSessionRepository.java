package com.educonnect.backend.repository;

import com.educonnect.backend.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    List<AttendanceSession> findByTeacherSubjectId(UUID teacherSubjectId);
    List<AttendanceSession> findByTeacherSubjectIdIn(Collection<UUID> teacherSubjectIds);
    Optional<AttendanceSession> findByTeacherSubjectIdAndSessionDateAndLectureNo(UUID teacherSubjectId, LocalDate sessionDate, Integer lectureNo);
}
