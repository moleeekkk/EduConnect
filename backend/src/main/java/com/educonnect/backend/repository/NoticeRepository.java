package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, UUID> {

    List<Notice> findByAuthorId(UUID authorId);

    @Query("SELECT n FROM Notice n WHERE n.isActive = true AND n.isArchived = false ORDER BY n.publishDate DESC")
    List<Notice> findAllActiveNotices();

    @Query("SELECT n FROM Notice n WHERE n.isActive = true AND n.isArchived = false AND n.publishDate <= :now AND (n.expiryDate IS NULL OR n.expiryDate > :now) ORDER BY n.publishDate DESC")
    List<Notice> findActiveUnexpiredNotices(@Param("now") LocalDateTime now);
}
