package com.educonnect.backend.service;

import com.educonnect.backend.entity.Department;
import com.educonnect.backend.entity.Institute;
import com.educonnect.backend.entity.Semester;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.repository.DepartmentRepository;
import com.educonnect.backend.repository.InstituteRepository;
import com.educonnect.backend.repository.SemesterRepository;
import com.educonnect.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final InstituteRepository instituteRepository;
    private final SemesterRepository semesterRepository;
    private final SubjectRepository subjectRepository;


    @Transactional
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Optional<Department> getDepartmentById(UUID id) {
        return departmentRepository.findById(id);
    }

    @Transactional
    public Department createDepartment(Department department) {
        if (department.getDurationYears() == null) {
            department.setDurationYears(2);
        }
        if (department.getIsActive() == null) {
            department.setIsActive(true);
        }
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(UUID id, Department updatedDept) {
        return departmentRepository.findById(id).map(existing -> {
            if (updatedDept.getDepartmentCode() != null) existing.setDepartmentCode(updatedDept.getDepartmentCode());
            if (updatedDept.getDepartmentName() != null) existing.setDepartmentName(updatedDept.getDepartmentName());
            if (updatedDept.getInstituteId() != null) existing.setInstituteId(updatedDept.getInstituteId());
            if (updatedDept.getDurationYears() != null) existing.setDurationYears(updatedDept.getDurationYears());
            if (updatedDept.getDescription() != null) existing.setDescription(updatedDept.getDescription());
            if (updatedDept.getIsActive() != null) existing.setIsActive(updatedDept.getIsActive());

            return departmentRepository.save(existing);
        }).orElseGet(() -> {
            updatedDept.setDepartmentId(id);
            return departmentRepository.save(updatedDept);
        });
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        departmentRepository.deleteById(id);
    }

    @Transactional
    public List<Institute> getAllInstitutes() {
        return instituteRepository.findAll();
    }

    @Transactional
    public Institute createInstitute(Institute institute) {
        return instituteRepository.save(institute);
    }

    @Transactional
    public Institute updateInstitute(UUID id, Institute updatedInst) {
        return instituteRepository.findById(id).map(existing -> {
            if (updatedInst.getInstituteCode() != null) existing.setInstituteCode(updatedInst.getInstituteCode());
            if (updatedInst.getInstituteName() != null) existing.setInstituteName(updatedInst.getInstituteName());
            if (updatedInst.getDescription() != null) existing.setDescription(updatedInst.getDescription());
            if (updatedInst.getContactEmail() != null) existing.setContactEmail(updatedInst.getContactEmail());
            if (updatedInst.getContactMobile() != null) existing.setContactMobile(updatedInst.getContactMobile());
            if (updatedInst.getCampusLocation() != null) existing.setCampusLocation(updatedInst.getCampusLocation());
            if (updatedInst.getIsActive() != null) existing.setIsActive(updatedInst.getIsActive());
            return instituteRepository.save(existing);
        }).orElseGet(() -> {
            updatedInst.setInstituteId(id);
            return instituteRepository.save(updatedInst);
        });
    }

    @Transactional
    public void deleteInstitute(UUID id) {
        instituteRepository.deleteById(id);
    }

    @Transactional
    public List<Semester> getAllSemesters() {
        return semesterRepository.findAllByOrderBySemesterNumberAsc();
    }

    @Transactional
    public Semester createSemester(Semester semester) {
        return semesterRepository.save(semester);
    }

    @Transactional
    public Semester updateSemester(UUID id, Semester updatedSem) {
        return semesterRepository.findById(id).map(existing -> {
            if (updatedSem.getSemesterName() != null) existing.setSemesterName(updatedSem.getSemesterName());
            if (updatedSem.getSemesterNumber() != null) existing.setSemesterNumber(updatedSem.getSemesterNumber());
            if (updatedSem.getDepartmentId() != null) existing.setDepartmentId(updatedSem.getDepartmentId());
            if (updatedSem.getIsActive() != null) existing.setIsActive(updatedSem.getIsActive());
            return semesterRepository.save(existing);
        }).orElseGet(() -> {
            updatedSem.setSemesterId(id);
            return semesterRepository.save(updatedSem);
        });
    }

    @Transactional
    public void deleteSemester(UUID id) {
        semesterRepository.deleteById(id);
    }

    // --- Subject Methods ---
    @Transactional
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Transactional
    public Subject createSubject(Subject subject) {
        if (subject.getDepartmentId() == null) {
            List<Department> depts = departmentRepository.findAll();
            if (!depts.isEmpty()) {
                subject.setDepartmentId(depts.get(0).getDepartmentId());
            } else {
                Department defaultDept = Department.builder()
                        .departmentCode("GEN")
                        .departmentName("General Academic Department")
                        .durationYears(2)
                        .isActive(true)
                        .build();
                defaultDept = departmentRepository.save(defaultDept);
                subject.setDepartmentId(defaultDept.getDepartmentId());
            }
        }
        if (subject.getSemesterId() == null) {
            List<Semester> sems = semesterRepository.findAllByOrderBySemesterNumberAsc();
            if (!sems.isEmpty()) {
                subject.setSemesterId(sems.get(0).getSemesterId());
            }
        }
        if (subject.getSubjectCode() == null || subject.getSubjectCode().trim().isEmpty()) {
            subject.setSubjectCode("SUBJ-" + (System.currentTimeMillis() % 10000));
        }
        if (subject.getSubjectName() == null || subject.getSubjectName().trim().isEmpty()) {
            subject.setSubjectName("New Subject");
        }
        if (subject.getCredits() == null) {
            subject.setCredits(4);
        }
        if (subject.getSubjectType() == null) {
            subject.setSubjectType("Core Theory");
        }
        if (subject.getIsActive() == null) {
            subject.setIsActive(true);
        }
        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject updateSubject(UUID id, Subject updatedSubj) {
        return subjectRepository.findById(id).map(existing -> {
            if (updatedSubj.getSubjectCode() != null) existing.setSubjectCode(updatedSubj.getSubjectCode());
            if (updatedSubj.getSubjectName() != null) existing.setSubjectName(updatedSubj.getSubjectName());
            if (updatedSubj.getDepartmentId() != null) existing.setDepartmentId(updatedSubj.getDepartmentId());
            if (updatedSubj.getSemesterId() != null) existing.setSemesterId(updatedSubj.getSemesterId());
            if (updatedSubj.getCredits() != null) existing.setCredits(updatedSubj.getCredits());
            if (updatedSubj.getSubjectType() != null) existing.setSubjectType(updatedSubj.getSubjectType());
            if (updatedSubj.getIsActive() != null) existing.setIsActive(updatedSubj.getIsActive());
            return subjectRepository.save(existing);
        }).orElseGet(() -> {
            updatedSubj.setSubjectId(id);
            return subjectRepository.save(updatedSubj);
        });
    }

    @Transactional
    public void deleteSubject(UUID id) {
        subjectRepository.deleteById(id);
    }
}
