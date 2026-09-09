package com.educonnect.backend.repository;

import com.educonnect.backend.entity.WeeklyTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WeeklyTestRepository extends JpaRepository<WeeklyTest, UUID> {
}
