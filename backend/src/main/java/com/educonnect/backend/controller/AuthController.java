package com.educonnect.backend.controller;

import com.educonnect.backend.dto.*;
import com.educonnect.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/student/send-otp")
    public ResponseEntity<AuthResponse> sendStudentOtp(@Valid @RequestBody StudentOtpRequest request) {
        AuthResponse response = authService.sendStudentOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/student/verify-otp")
    public ResponseEntity<AuthResponse> verifyStudentOtp(@Valid @RequestBody StudentOtpVerifyRequest request) {
        AuthResponse response = authService.verifyStudentOtp(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/teacher/login")
    public ResponseEntity<AuthResponse> teacherLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.teacherLogin(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.adminLogin(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
