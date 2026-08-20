package com.educonnect.backend.controller;

import com.educonnect.backend.dto.UserDto;
import com.educonnect.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> data = adminService.getAdminDashboard();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getAdminProfile(Principal principal) {
        String identifier = principal != null ? principal.getName() : "admin@educonnect.ac.in";
        Map<String, Object> profile = adminService.getAdminProfile(identifier);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateAdminProfile(
            @RequestBody Map<String, Object> updateData,
            Principal principal) {
        String identifier = principal != null ? principal.getName() : "admin@educonnect.ac.in";
        Map<String, Object> result = adminService.updateAdminProfile(updateData, identifier);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        UserDto created = adminService.createUser(userDto);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses() {
        List<Map<String, Object>> courses = adminService.getCourses();
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> createCourse(@RequestBody Map<String, Object> courseData) {
        Map<String, Object> created = adminService.createCourse(courseData);
        return ResponseEntity.ok(created);
    }
}
