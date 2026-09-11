package com.educonnect.backend.security;

import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String identifier;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7).trim();

        if (jwt.isEmpty() || !jwtService.isTokenValid(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        identifier = jwtService.extractIdentifier(jwt);
        String role = jwtService.extractRole(jwt);

        if (identifier != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            boolean isActive = isAccountActive(identifier, role);
            if (!isActive) {
                log.warn("Authentication rejected in filter: User {} with role {} is disabled or does not exist.", identifier, role);
                filterChain.doFilter(request, response);
                return;
            }

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(authority);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    identifier,
                    null,
                    authorities
            );

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAccountActive(String identifier, String role) {
        try {
            if ("ROLE_STUDENT".equalsIgnoreCase(role)) {
                return studentRepository.findByEnrollmentNoIgnoreCase(identifier)
                        .map(s -> !Boolean.FALSE.equals(s.getIsActive()))
                        .orElseGet(() -> studentRepository.findByEmail(identifier)
                                .map(s -> !Boolean.FALSE.equals(s.getIsActive()))
                                .orElse(false));
            } else if ("ROLE_TEACHER".equalsIgnoreCase(role)) {
                return teacherRepository.findByEmail(identifier)
                        .map(t -> !Boolean.FALSE.equals(t.getIsActive()))
                        .orElse(false);
            } else if ("ROLE_ADMIN".equalsIgnoreCase(role)) {
                return adminRepository.findByEmail(identifier)
                        .map(a -> !Boolean.FALSE.equals(a.getIsActive()))
                        .orElse(false);
            }
        } catch (Exception e) {
            log.error("Error checking account active status for {}: {}", identifier, e.getMessage());
            return false;
        }
        return true;
    }
}
