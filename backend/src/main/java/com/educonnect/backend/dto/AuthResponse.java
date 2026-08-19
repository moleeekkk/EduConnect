package com.educonnect.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private String role; // "Student", "Teacher", "Admin"
    private String userId;
    private String name;
    private String identifier; // Enrollment No or Email
    private String maskedPhone;
    private String maskedEmail;
}
