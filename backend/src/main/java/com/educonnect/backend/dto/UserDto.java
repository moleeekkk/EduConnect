package com.educonnect.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String department;
    private String status;
    private String identifier;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static UserDtoBuilder builder() {
        return new UserDtoBuilder();
    }

    public static class UserDtoBuilder {
        private String id;
        private String name;
        private String email;
        private String role;
        private String department;
        private String status;
        private String identifier;

        public UserDtoBuilder id(String id) { this.id = id; return this; }
        public UserDtoBuilder name(String name) { this.name = name; return this; }
        public UserDtoBuilder email(String email) { this.email = email; return this; }
        public UserDtoBuilder role(String role) { this.role = role; return this; }
        public UserDtoBuilder department(String department) { this.department = department; return this; }
        public UserDtoBuilder status(String status) { this.status = status; return this; }
        public UserDtoBuilder identifier(String identifier) { this.identifier = identifier; return this; }

        public UserDto build() {
            UserDto u = new UserDto();
            u.setId(id);
            u.setName(name);
            u.setEmail(email);
            u.setRole(role);
            u.setDepartment(department);
            u.setStatus(status);
            u.setIdentifier(identifier);
            return u;
        }
    }
}
