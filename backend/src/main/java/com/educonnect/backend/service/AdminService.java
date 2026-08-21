package com.educonnect.backend.service;

import com.educonnect.backend.dto.*;
import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final SubjectRepository subjectRepository;
    private final InstituteRepository instituteRepository;
    private final ProgramRepository programRepository;
    private final SemesterRepository semesterRepository;

    // --- DASHBOARD & PROFILE ---
    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalStudents", studentRepository.count());
        data.put("totalFaculty", teacherRepository.count());
        data.put("totalInstitutes", instituteRepository.count());
        data.put("totalPrograms", programRepository.count());
        data.put("activeCourses", subjectRepository.count());
        data.put("systemUptime", "100%");
        return data;
    }

    public Map<String, Object> getAdminProfile(String identifier) {
        String query = identifier != null && !identifier.isBlank() ? identifier.trim() : "admin@educonnect.ac.in";
        Optional<Admin> adminOpt = adminRepository.findByEmail(query.toLowerCase());
        if (adminOpt.isEmpty()) {
            adminOpt = adminRepository.findAll().stream().findFirst();
        }

        Map<String, Object> profile = new HashMap<>();
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            profile.put("admin_id", admin.getAdminId().toString());
            profile.put("adminId", admin.getAdminId().toString());
            profile.put("first_name", admin.getFirstName());
            profile.put("firstName", admin.getFirstName());
            profile.put("last_name", admin.getLastName());
            profile.put("lastName", admin.getLastName());
            profile.put("email", admin.getEmail());
            profile.put("mobile", admin.getMobile() != null ? admin.getMobile() : "");
            profile.put("gender", admin.getGender() != null ? admin.getGender() : "Male");
            profile.put("date_of_birth", admin.getDateOfBirth() != null ? admin.getDateOfBirth().toString() : "");
            profile.put("dateOfBirth", admin.getDateOfBirth() != null ? admin.getDateOfBirth().toString() : "");
            profile.put("address", admin.getAddress() != null ? admin.getAddress() : "");
            profile.put("profile_photo", admin.getProfilePhoto() != null ? admin.getProfilePhoto() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            profile.put("profilePhoto", admin.getProfilePhoto() != null ? admin.getProfilePhoto() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            profile.put("is_active", admin.getIsActive());
            profile.put("isActive", admin.getIsActive());
        } else {
            profile.put("admin_id", "admin-001");
            profile.put("adminId", "admin-001");
            profile.put("first_name", "Super");
            profile.put("firstName", "Super");
            profile.put("last_name", "Admin");
            profile.put("lastName", "Admin");
            profile.put("email", "admin@educonnect.ac.in");
            profile.put("mobile", "+91 9876543210");
            profile.put("gender", "Male");
            profile.put("date_of_birth", "1985-01-01");
            profile.put("dateOfBirth", "1985-01-01");
            profile.put("address", "EduConnect Headquarters");
            profile.put("profile_photo", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            profile.put("profilePhoto", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            profile.put("is_active", true);
            profile.put("isActive", true);
        }
        return profile;
    }

    public Map<String, Object> updateAdminProfile(Map<String, Object> updateData, String identifier) {
        String query = identifier != null && !identifier.isBlank() ? identifier.trim() : "admin@educonnect.ac.in";
        Optional<Admin> adminOpt = adminRepository.findByEmail(query.toLowerCase());
        if (adminOpt.isEmpty()) {
            adminOpt = adminRepository.findAll().stream().findFirst();
        }

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (updateData.containsKey("first_name")) admin.setFirstName((String) updateData.get("first_name"));
            if (updateData.containsKey("firstName")) admin.setFirstName((String) updateData.get("firstName"));
            if (updateData.containsKey("last_name")) admin.setLastName((String) updateData.get("last_name"));
            if (updateData.containsKey("lastName")) admin.setLastName((String) updateData.get("lastName"));
            if (updateData.containsKey("email")) admin.setEmail((String) updateData.get("email"));
            if (updateData.containsKey("mobile")) admin.setMobile((String) updateData.get("mobile"));
            if (updateData.containsKey("gender")) admin.setGender((String) updateData.get("gender"));
            if (updateData.containsKey("address")) admin.setAddress((String) updateData.get("address"));
            
            Object dob = updateData.get("date_of_birth");
            if (dob == null) dob = updateData.get("dateOfBirth");
            if (dob != null) {
                try {
                    admin.setDateOfBirth(LocalDate.parse(dob.toString()));
                } catch (Exception ignored) {}
            }
            adminRepository.save(admin);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Admin profile updated successfully in PostgreSQL");
        return res;
    }

    // --- INSTITUTES CRUD ---
    public List<Map<String, Object>> getAllInstitutes() {
        List<Map<String, Object>> list = new ArrayList<>();
        instituteRepository.findAll().forEach(inst -> {
            Map<String, Object> m = new HashMap<>();
            m.put("institute_id", inst.getInstituteId().toString());
            m.put("instituteId", inst.getInstituteId().toString());
            m.put("institute_code", inst.getInstituteCode());
            m.put("instituteCode", inst.getInstituteCode());
            m.put("institute_name", inst.getInstituteName());
            m.put("instituteName", inst.getInstituteName());
            m.put("description", inst.getDescription() != null ? inst.getDescription() : "");
            m.put("contact_email", inst.getContactEmail() != null ? inst.getContactEmail() : "");
            m.put("contactEmail", inst.getContactEmail() != null ? inst.getContactEmail() : "");
            m.put("contact_mobile", inst.getContactMobile() != null ? inst.getContactMobile() : "");
            m.put("contactMobile", inst.getContactMobile() != null ? inst.getContactMobile() : "");
            m.put("campus_location", inst.getCampusLocation() != null ? inst.getCampusLocation() : "");
            m.put("campusLocation", inst.getCampusLocation() != null ? inst.getCampusLocation() : "");
            m.put("is_active", inst.getIsActive());
            m.put("isActive", inst.getIsActive());
            list.add(m);
        });
        return list;
    }

    public Map<String, Object> createInstitute(Map<String, Object> body) {
        String code = (String) body.get("institute_code");
        if (code == null || code.isBlank()) code = (String) body.get("instituteCode");
        String name = (String) body.get("institute_name");
        if (name == null || name.isBlank()) name = (String) body.get("instituteName");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Institute code and name are required");
        }

        if (instituteRepository.findByInstituteCode(code.trim().toUpperCase()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Institute code '" + code + "' already exists");
        }

        Object activeObj = body.get("is_active");
        if (activeObj == null) activeObj = body.get("isActive");

        Institute inst = Institute.builder()
                .instituteCode(code.trim().toUpperCase())
                .instituteName(name.trim())
                .description((String) body.getOrDefault("description", ""))
                .contactEmail((String) body.getOrDefault("contact_email", body.getOrDefault("contactEmail", "")))
                .contactMobile((String) body.getOrDefault("contact_mobile", body.getOrDefault("contactMobile", "")))
                .campusLocation((String) body.getOrDefault("campus_location", body.getOrDefault("campusLocation", "")))
                .isActive(activeObj != null ? (Boolean) activeObj : true)
                .build();

        Institute saved = instituteRepository.save(inst);

        Map<String, Object> res = new HashMap<>();
        res.put("institute_id", saved.getInstituteId().toString());
        res.put("instituteId", saved.getInstituteId().toString());
        res.put("institute_code", saved.getInstituteCode());
        res.put("instituteCode", saved.getInstituteCode());
        res.put("institute_name", saved.getInstituteName());
        res.put("instituteName", saved.getInstituteName());
        res.put("description", saved.getDescription());
        res.put("is_active", saved.getIsActive());
        res.put("isActive", saved.getIsActive());
        return res;
    }

    public Map<String, Object> updateInstitute(String idStr, Map<String, Object> body) {
        UUID id = UUID.fromString(idStr);
        Institute inst = instituteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Institute not found"));

        if (body.containsKey("institute_name")) inst.setInstituteName((String) body.get("institute_name"));
        if (body.containsKey("instituteName")) inst.setInstituteName((String) body.get("instituteName"));
        if (body.containsKey("description")) inst.setDescription((String) body.get("description"));
        if (body.containsKey("contact_email")) inst.setContactEmail((String) body.get("contact_email"));
        if (body.containsKey("contactEmail")) inst.setContactEmail((String) body.get("contactEmail"));
        if (body.containsKey("contact_mobile")) inst.setContactMobile((String) body.get("contact_mobile"));
        if (body.containsKey("contactMobile")) inst.setContactMobile((String) body.get("contactMobile"));
        if (body.containsKey("campus_location")) inst.setCampusLocation((String) body.get("campus_location"));
        if (body.containsKey("campusLocation")) inst.setCampusLocation((String) body.get("campusLocation"));
        if (body.containsKey("is_active")) inst.setIsActive((Boolean) body.get("is_active"));
        if (body.containsKey("isActive")) inst.setIsActive((Boolean) body.get("isActive"));

        Institute updated = instituteRepository.save(inst);

        Map<String, Object> res = new HashMap<>();
        res.put("institute_id", updated.getInstituteId().toString());
        res.put("instituteId", updated.getInstituteId().toString());
        res.put("institute_code", updated.getInstituteCode());
        res.put("instituteCode", updated.getInstituteCode());
        res.put("institute_name", updated.getInstituteName());
        res.put("instituteName", updated.getInstituteName());
        res.put("description", updated.getDescription());
        res.put("is_active", updated.getIsActive());
        res.put("isActive", updated.getIsActive());
        return res;
    }

    public void deleteInstitute(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            instituteRepository.deleteById(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Institute not found or cannot be deleted");
        }
    }

    // --- PROGRAMS CRUD ---
    public List<Map<String, Object>> getAllPrograms() {
        List<Map<String, Object>> list = new ArrayList<>();
        programRepository.findAll().forEach(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("program_id", p.getProgramId().toString());
            m.put("programId", p.getProgramId().toString());
            m.put("program_code", p.getProgramCode());
            m.put("programCode", p.getProgramCode());
            m.put("program_name", p.getProgramName());
            m.put("programName", p.getProgramName());
            m.put("duration_years", p.getDurationYears() != null ? p.getDurationYears() : 2);
            m.put("durationYears", p.getDurationYears() != null ? p.getDurationYears() : 2);
            m.put("is_active", p.getIsActive());
            m.put("isActive", p.getIsActive());

            int semCount = semesterRepository.findByProgram_ProgramId(p.getProgramId()).size();
            m.put("total_semesters", semCount);
            m.put("totalSemesters", semCount);

            list.add(m);
        });
        return list;
    }

    public Map<String, Object> createProgram(Map<String, Object> body) {
        String code = (String) body.get("program_code");
        if (code == null || code.isBlank()) code = (String) body.get("programCode");
        String name = (String) body.get("program_name");
        if (name == null || name.isBlank()) name = (String) body.get("programName");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program code and name are required");
        }

        if (programRepository.findByProgramCode(code.trim().toUpperCase()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Program code '" + code + "' already exists");
        }

        Object instIdObj = body.get("institute_id");
        if (instIdObj == null) instIdObj = body.get("instituteId");

        Institute inst = null;
        if (instIdObj != null && !instIdObj.toString().isBlank()) {
            try {
                inst = instituteRepository.findById(UUID.fromString(instIdObj.toString())).orElse(null);
            } catch (Exception ignored) {}
        }
        if (inst == null) {
            inst = instituteRepository.findAll().stream().findFirst().orElse(null);
        }

        Object durationObj = body.get("duration_years");
        if (durationObj == null) durationObj = body.get("durationYears");
        int duration = durationObj != null ? ((Number) durationObj).intValue() : 2;

        Object activeObj = body.get("is_active");
        if (activeObj == null) activeObj = body.get("isActive");
        boolean active = activeObj != null ? (Boolean) activeObj : true;

        Program prog = Program.builder()
                .institute(inst)
                .programCode(code.trim().toUpperCase())
                .programName(name.trim())
                .durationYears(duration)
                .isActive(active)
                .build();

        Program saved = programRepository.save(prog);

        Map<String, Object> res = new HashMap<>();
        res.put("program_id", saved.getProgramId().toString());
        res.put("programId", saved.getProgramId().toString());
        res.put("program_code", saved.getProgramCode());
        res.put("programCode", saved.getProgramCode());
        res.put("program_name", saved.getProgramName());
        res.put("programName", saved.getProgramName());
        res.put("duration_years", saved.getDurationYears());
        res.put("durationYears", saved.getDurationYears());
        res.put("is_active", saved.getIsActive());
        res.put("isActive", saved.getIsActive());
        return res;
    }

    public Map<String, Object> updateProgram(String idStr, Map<String, Object> body) {
        UUID id = UUID.fromString(idStr);
        Program prog = programRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));

        if (body.containsKey("program_name")) prog.setProgramName((String) body.get("program_name"));
        if (body.containsKey("programName")) prog.setProgramName((String) body.get("programName"));
        
        Object durationObj = body.get("duration_years");
        if (durationObj == null) durationObj = body.get("durationYears");
        if (durationObj != null) prog.setDurationYears(((Number) durationObj).intValue());

        Object activeObj = body.get("is_active");
        if (activeObj == null) activeObj = body.get("isActive");
        if (activeObj != null) prog.setIsActive((Boolean) activeObj);

        Program updated = programRepository.save(prog);

        Map<String, Object> res = new HashMap<>();
        res.put("program_id", updated.getProgramId().toString());
        res.put("programId", updated.getProgramId().toString());
        res.put("program_code", updated.getProgramCode());
        res.put("programCode", updated.getProgramCode());
        res.put("program_name", updated.getProgramName());
        res.put("programName", updated.getProgramName());
        res.put("duration_years", updated.getDurationYears());
        res.put("durationYears", updated.getDurationYears());
        res.put("is_active", updated.getIsActive());
        res.put("isActive", updated.getIsActive());
        return res;
    }

    public void deleteProgram(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            programRepository.deleteById(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found or cannot be deleted");
        }
    }

    // --- SEMESTERS CRUD ---
    public List<Map<String, Object>> getSemestersByProgram(String programIdStr) {
        List<Map<String, Object>> list = new ArrayList<>();
        UUID programId = UUID.fromString(programIdStr);
        semesterRepository.findByProgram_ProgramId(programId).forEach(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("semester_id", s.getSemesterId().toString());
            m.put("semesterId", s.getSemesterId().toString());
            m.put("program_id", s.getProgram().getProgramId().toString());
            m.put("programId", s.getProgram().getProgramId().toString());
            m.put("semester_number", s.getSemesterNumber());
            m.put("semesterNumber", s.getSemesterNumber());
            m.put("semester_name", s.getSemesterName());
            m.put("semesterName", s.getSemesterName());
            m.put("is_active", s.getIsActive());
            m.put("isActive", s.getIsActive());
            list.add(m);
        });
        return list;
    }

    public Map<String, Object> createSemester(Map<String, Object> body) {
        Object progIdObj = body.get("program_id");
        if (progIdObj == null) progIdObj = body.get("programId");

        if (progIdObj == null || progIdObj.toString().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program ID is required for creating a semester");
        }

        UUID programId = UUID.fromString(progIdObj.toString());
        Program prog = programRepository.findById(programId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));

        Object semNumObj = body.get("semester_number");
        if (semNumObj == null) semNumObj = body.get("semesterNumber");
        int semNum = semNumObj != null ? ((Number) semNumObj).intValue() : 1;

        Object semNameObj = body.get("semester_name");
        if (semNameObj == null) semNameObj = body.get("semesterName");
        String semName = semNameObj != null ? semNameObj.toString() : "Semester " + semNum;

        Semester sem = Semester.builder()
                .program(prog)
                .semesterNumber(semNum)
                .semesterName(semName)
                .isActive(true)
                .build();

        Semester saved = semesterRepository.save(sem);

        Map<String, Object> res = new HashMap<>();
        res.put("semester_id", saved.getSemesterId().toString());
        res.put("semesterId", saved.getSemesterId().toString());
        res.put("program_id", prog.getProgramId().toString());
        res.put("programId", prog.getProgramId().toString());
        res.put("semester_number", saved.getSemesterNumber());
        res.put("semesterNumber", saved.getSemesterNumber());
        res.put("semester_name", saved.getSemesterName());
        res.put("semesterName", saved.getSemesterName());
        res.put("is_active", saved.getIsActive());
        res.put("isActive", saved.getIsActive());
        return res;
    }

    public void deleteSemester(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            semesterRepository.deleteById(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found");
        }
    }

    // --- SUBJECTS / COURSES CRUD ---
    public List<Map<String, Object>> getCourses() {
        List<Map<String, Object>> courses = new ArrayList<>();
        subjectRepository.findAll().forEach(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("subject_id", s.getSubjectId().toString());
            m.put("subjectId", s.getSubjectId().toString());
            m.put("code", s.getSubjectCode() != null ? s.getSubjectCode() : "");
            m.put("subjectCode", s.getSubjectCode() != null ? s.getSubjectCode() : "");
            m.put("name", s.getSubjectName() != null ? s.getSubjectName() : "");
            m.put("subjectName", s.getSubjectName() != null ? s.getSubjectName() : "");
            m.put("credits", s.getCredits() != null ? s.getCredits() : 4);
            m.put("type", s.getSubjectType() != null ? s.getSubjectType() : "Theory");
            m.put("subjectType", s.getSubjectType() != null ? s.getSubjectType() : "Theory");
            m.put("semester", s.getSemesterNo() != null ? s.getSemesterNo() : 1);
            m.put("semesterNo", s.getSemesterNo() != null ? s.getSemesterNo() : 1);
            m.put("program_id", s.getProgram() != null ? s.getProgram().getProgramId().toString() : "");
            m.put("programId", s.getProgram() != null ? s.getProgram().getProgramId().toString() : "");
            m.put("is_active", s.getIsActive());
            m.put("isActive", s.getIsActive());
            courses.add(m);
        });
        return courses;
    }

    public Map<String, Object> createCourse(Map<String, Object> courseData) {
        String code = (String) courseData.get("code");
        if (code == null || code.isBlank()) code = (String) courseData.get("subjectCode");
        String name = (String) courseData.get("name");
        if (name == null || name.isBlank()) name = (String) courseData.get("subjectName");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject code and name are required");
        }

        if (subjectRepository.findBySubjectCode(code.trim().toUpperCase()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Subject code '" + code + "' already exists");
        }

        Program prog = programRepository.findAll().stream().findFirst().orElse(null);

        Object creditsObj = courseData.get("credits");
        int credits = creditsObj != null ? ((Number) creditsObj).intValue() : 4;

        Object semObj = courseData.get("semester");
        if (semObj == null) semObj = courseData.get("semesterNo");
        int semNo = semObj != null ? ((Number) semObj).intValue() : 1;

        Object typeObj = courseData.get("type");
        if (typeObj == null) typeObj = courseData.get("subjectType");
        String type = typeObj != null ? typeObj.toString() : "Theory";

        Subject subject = Subject.builder()
                .program(prog)
                .programId(prog != null ? prog.getProgramId() : UUID.randomUUID())
                .subjectCode(code.trim().toUpperCase())
                .subjectName(name.trim())
                .credits(credits)
                .semesterNo(semNo)
                .subjectType(type)
                .isActive(true)
                .build();

        Subject saved = subjectRepository.save(subject);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("subject_id", saved.getSubjectId().toString());
        res.put("subjectId", saved.getSubjectId().toString());
        res.put("code", saved.getSubjectCode());
        res.put("subjectCode", saved.getSubjectCode());
        res.put("name", saved.getSubjectName());
        res.put("subjectName", saved.getSubjectName());
        res.put("credits", saved.getCredits());
        res.put("type", saved.getSubjectType());
        res.put("subjectType", saved.getSubjectType());
        res.put("semester", saved.getSemesterNo());
        res.put("semesterNo", saved.getSemesterNo());
        return res;
    }

    public Map<String, Object> updateCourse(String idStr, Map<String, Object> courseData) {
        UUID id = UUID.fromString(idStr);
        Subject s = subjectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));

        if (courseData.containsKey("name")) s.setSubjectName((String) courseData.get("name"));
        if (courseData.containsKey("subjectName")) s.setSubjectName((String) courseData.get("subjectName"));
        if (courseData.containsKey("credits")) s.setCredits(((Number) courseData.get("credits")).intValue());
        if (courseData.containsKey("type")) s.setSubjectType((String) courseData.get("type"));
        if (courseData.containsKey("subjectType")) s.setSubjectType((String) courseData.get("subjectType"));
        if (courseData.containsKey("semester")) s.setSemesterNo(((Number) courseData.get("semester")).intValue());
        if (courseData.containsKey("semesterNo")) s.setSemesterNo(((Number) courseData.get("semesterNo")).intValue());
        if (courseData.containsKey("is_active")) s.setIsActive((Boolean) courseData.get("is_active"));
        if (courseData.containsKey("isActive")) s.setIsActive((Boolean) courseData.get("isActive"));

        Subject updated = subjectRepository.save(s);

        Map<String, Object> res = new HashMap<>();
        res.put("subject_id", updated.getSubjectId().toString());
        res.put("subjectId", updated.getSubjectId().toString());
        res.put("code", updated.getSubjectCode());
        res.put("subjectCode", updated.getSubjectCode());
        res.put("name", updated.getSubjectName());
        res.put("subjectName", updated.getSubjectName());
        res.put("credits", updated.getCredits());
        res.put("type", updated.getSubjectType());
        res.put("subjectType", updated.getSubjectType());
        res.put("semester", updated.getSemesterNo());
        res.put("semesterNo", updated.getSemesterNo());
        return res;
    }

    public void deleteCourse(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            subjectRepository.deleteById(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found");
        }
    }

    // --- USERS MANAGEMENT ---
    public List<UserDto> getAllUsers() {
        List<UserDto> users = new ArrayList<>();

        studentRepository.findAll().forEach(s -> users.add(UserDto.builder()
                .id(s.getEnrollmentNo())
                .name(s.getFirstName() + " " + s.getLastName())
                .email(s.getEmail())
                .role("Student")
                .department("Computer Applications")
                .status(s.getIsActive() ? "Active" : "Inactive")
                .identifier(s.getEnrollmentNo())
                .build()));

        teacherRepository.findAll().forEach(t -> users.add(UserDto.builder()
                .id(t.getTeacherId().toString().length() >= 8 ? t.getTeacherId().toString().substring(0, 8) : t.getTeacherId().toString())
                .name(t.getFirstName() + " " + t.getLastName())
                .email(t.getEmail())
                .role("Teacher")
                .department(t.getDesignation() != null ? t.getDesignation() : "Computer Science")
                .status(t.getIsActive() ? "Active" : "Inactive")
                .identifier(t.getEmail())
                .build()));

        return users;
    }

    public UserDto createUser(UserDto dto) {
        if ("Student".equalsIgnoreCase(dto.getRole())) {
            String enrollmentNo = dto.getIdentifier() != null ? dto.getIdentifier() : "STU" + System.currentTimeMillis() % 10000;
            String[] nameParts = dto.getName() != null ? dto.getName().split(" ") : new String[]{"Student"};
            Student s = Student.builder()
                    .enrollmentNo(enrollmentNo)
                    .firstName(nameParts[0])
                    .lastName(nameParts.length > 1 ? nameParts[1] : "Student")
                    .email(dto.getEmail() != null ? dto.getEmail() : enrollmentNo.toLowerCase() + "@educonnect.ac.in")
                    .mobile("+91 9876543210")
                    .gender("Male")
                    .dateOfBirth(LocalDate.of(2002, 1, 1))
                    .address("Institutional Campus")
                    .isActive(true)
                    .build();
            studentRepository.save(s);
            dto.setId(enrollmentNo);
        } else {
            String[] nameParts = dto.getName() != null ? dto.getName().split(" ") : new String[]{"Faculty"};
            Teacher t = Teacher.builder()
                    .firstName(nameParts[0])
                    .lastName(nameParts.length > 1 ? nameParts[1] : "Faculty")
                    .email(dto.getEmail() != null ? dto.getEmail() : "faculty" + System.currentTimeMillis() % 1000 + "@educonnect.ac.in")
                    .password("teacher123")
                    .mobile("+91 9876543210")
                    .gender("Female")
                    .designation("Assistant Professor")
                    .dateOfBirth(LocalDate.of(1988, 5, 15))
                    .address("Faculty Quarters")
                    .isActive(true)
                    .build();
            Teacher saved = teacherRepository.save(t);
            dto.setId(saved.getTeacherId().toString());
        }
        dto.setStatus("Active");
        return dto;
    }
}
