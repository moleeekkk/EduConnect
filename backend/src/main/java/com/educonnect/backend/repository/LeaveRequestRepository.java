package com.educonnect.backend.repository;

import com.educonnect.backend.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    List<LeaveRequest> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    List<LeaveRequest> findByDepartmentIdInAndSemesterIdInOrderByCreatedAtDesc(List<UUID> departmentIds, List<UUID> semesterIds);

    List<LeaveRequest> findByStudentIdAndStatusNotAndFromDateLessThanEqualAndToDateGreaterThanEqual(
            UUID studentId, String excludeStatus, LocalDate toDate, LocalDate fromDate);
}
