package com.educonnect.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.FileNotFoundException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler({NoSuchElementException.class, FileNotFoundException.class})
    public ResponseEntity<Map<String, Object>> handleNotFoundException(Exception ex) {
        log.warn("Resource or File not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Resource or file requested was not found.");
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(SecurityException ex) {
        log.error("Access denied or security violation: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Access denied.");
    }

    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, Object>> handleBadRequestException(RuntimeException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        if (ex.getCause() instanceof FileNotFoundException || (ex.getMessage() != null && ex.getMessage().contains("File not found"))) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, "Requested file was not found on the server.");
        }
        log.error("Runtime exception encountered: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An internal server error occurred while processing the request.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An internal error occurred.");
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
