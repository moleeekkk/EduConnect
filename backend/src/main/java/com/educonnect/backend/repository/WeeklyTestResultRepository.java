package com.educonnect.backend.repository;

import com.educonnect.backend.entity.WeeklyTestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WeeklyTestResultRepository extends JpaRepository<WeeklyTestResult, UUID> {
    List<WeeklyTestResult> findByWeeklyTestId(UUID weeklyTestId);
    List<WeeklyTestResult> findByStudentId(UUID studentId);
    List<WeeklyTestResult> findByWeeklyTestIdAndStudentId(UUID weeklyTestId, UUID studentId);
}
