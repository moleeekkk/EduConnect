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
    private String email;
    private String maskedEmail;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getMaskedPhone() { return maskedPhone; }
    public void setMaskedPhone(String maskedPhone) { this.maskedPhone = maskedPhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMaskedEmail() { return maskedEmail; }
    public void setMaskedEmail(String maskedEmail) { this.maskedEmail = maskedEmail; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private boolean success;
        private String message;
        private String token;
        private String role;
        private String userId;
        private String name;
        private String identifier;
        private String maskedPhone;
        private String email;
        private String maskedEmail;

        public AuthResponseBuilder success(boolean success) { this.success = success; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }
        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder userId(String userId) { this.userId = userId; return this; }
        public AuthResponseBuilder name(String name) { this.name = name; return this; }
        public AuthResponseBuilder identifier(String identifier) { this.identifier = identifier; return this; }
        public AuthResponseBuilder maskedPhone(String maskedPhone) { this.maskedPhone = maskedPhone; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder maskedEmail(String maskedEmail) { this.maskedEmail = maskedEmail; return this; }

        public AuthResponse build() {
            AuthResponse res = new AuthResponse();
            res.success = this.success;
            res.message = this.message;
            res.token = this.token;
            res.role = this.role;
            res.userId = this.userId;
            res.name = this.name;
            res.identifier = this.identifier;
            res.maskedPhone = this.maskedPhone;
            res.email = this.email;
            res.maskedEmail = this.maskedEmail;
            return res;
        }
    }
}
