package com.educonnect.backend.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {
        // Private constructor for utility class
    }

    public static Optional<Authentication> getAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return Optional.of(auth);
    }

    public static String getCurrentUserIdentifier() {
        return getAuthentication()
                .map(auth -> auth.getName())
                .orElseThrow(() -> new AccessDeniedException("User is not authenticated."));
    }

    public static String getCurrentUserRole() {
        return getAuthentication()
                .flatMap(auth -> auth.getAuthorities().stream().findFirst().map(GrantedAuthority::getAuthority))
                .orElse("ROLE_ANONYMOUS");
    }

    public static boolean isAuthenticated() {
        return getAuthentication().isPresent();
    }

    public static boolean isAdmin() {
        String role = getCurrentUserRole();
        return "ROLE_ADMIN".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);
    }

    public static boolean isTeacher() {
        String role = getCurrentUserRole();
        return "ROLE_TEACHER".equalsIgnoreCase(role) || "TEACHER".equalsIgnoreCase(role);
    }

    public static boolean isStudent() {
        String role = getCurrentUserRole();
        return "ROLE_STUDENT".equalsIgnoreCase(role) || "STUDENT".equalsIgnoreCase(role);
    }

    public static void validateOwnershipOrAdmin(String targetIdentifier) {
        if (isAdmin()) {
            return;
        }
        String currentIdentifier = getCurrentUserIdentifier();
        if (targetIdentifier == null || !currentIdentifier.equalsIgnoreCase(targetIdentifier.trim())) {
            throw new AccessDeniedException("Access denied: Operation not permitted for user '" + currentIdentifier + "'.");
        }
    }
}
