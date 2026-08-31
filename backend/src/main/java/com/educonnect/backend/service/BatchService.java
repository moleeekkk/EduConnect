package com.educonnect.backend.service;

import com.educonnect.backend.entity.Batch;
import com.educonnect.backend.repository.BatchRepository;
import com.educonnect.backend.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    public Optional<Batch> getBatchById(UUID id) {
        return batchRepository.findById(id);
    }

    @Transactional
    public Batch createBatch(Batch batch) {
        if (batch.getStartYear() == null) {
            batch.setStartYear(LocalDateTime.now().getYear());
        }
        if (batch.getEndYear() == null || batch.getEndYear() < batch.getStartYear()) {
            batch.setEndYear(batch.getStartYear() + 2);
        }
        if (batch.getIsActive() == null) {
            batch.setIsActive(true);
        }
        return batchRepository.save(batch);
    }

    @Transactional
    public Batch updateBatch(UUID id, Batch updatedBatch) {
        return batchRepository.findById(id).map(existing -> {
            if (updatedBatch.getBatchName() != null) existing.setBatchName(updatedBatch.getBatchName());
            if (updatedBatch.getStartYear() != null) existing.setStartYear(updatedBatch.getStartYear());
            if (updatedBatch.getEndYear() != null) {
                int start = existing.getStartYear() != null ? existing.getStartYear() : LocalDateTime.now().getYear();
                existing.setEndYear(updatedBatch.getEndYear() >= start ? updatedBatch.getEndYear() : start + 2);
            }
            if (updatedBatch.getIsActive() != null) existing.setIsActive(updatedBatch.getIsActive());
            return batchRepository.save(existing);
        }).orElseGet(() -> {
            updatedBatch.setBatchId(id);
            return batchRepository.save(updatedBatch);
        });
    }

    @Transactional
    public void deleteBatch(UUID id) {
        batchRepository.deleteById(id);
    }

    @Transactional
    public Batch toggleBatchStatus(UUID id) {
        return batchRepository.findById(id).map(existing -> {
            existing.setIsActive(!Boolean.TRUE.equals(existing.getIsActive()));
            return batchRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Batch not found with ID: " + id));
    }
}
