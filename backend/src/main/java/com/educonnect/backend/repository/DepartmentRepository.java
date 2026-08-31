package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByDepartmentCode(String departmentCode);
    List<Department> findByInstituteId(UUID instituteId);
}
