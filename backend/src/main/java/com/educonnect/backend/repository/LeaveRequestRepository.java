package com.educonnect.backend.repository;

import com.educonnect.backend.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findByStudentId(UUID studentId);
    List<LeaveRequest> findByEnrollmentNo(String enrollmentNo);
}
