package com.educonnect.backend.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret:EduConnectSuperSecureJwtSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm2026}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    public String generateToken(String identifier, String role, String userId, String name) {
        String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
        long now = System.currentTimeMillis();
        long exp = now + jwtExpirationMs;

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = String.format(
            "{\"sub\":\"%s\",\"role\":\"%s\",\"userId\":\"%s\",\"name\":\"%s\",\"iat\":%d,\"exp\":%d}",
            escapeJson(identifier),
            escapeJson(normalizedRole),
            escapeJson(userId != null ? userId : ""),
            escapeJson(name != null ? name : ""),
            now / 1000,
            exp / 1000
        );

        String encodedHeader = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));

        String dataToSign = encodedHeader + "." + encodedPayload;
        String signature = hmacSha256(dataToSign, secret);

        return dataToSign + "." + signature;
    }

    public boolean isTokenValid(String token) {
        if (token == null || !token.contains(".")) return false;
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;

        String dataToSign = parts[0] + "." + parts[1];
        String expectedSignature = hmacSha256(dataToSign, secret);
        if (!expectedSignature.equals(parts[2])) {
            log.warn("JWT Signature verification failed.");
            return false;
        }

        Long exp = extractExpiration(token);
        if (exp == null) return false;
        return (exp * 1000) > System.currentTimeMillis();
    }

    public String extractIdentifier(String token) {
        return extractClaimString(token, "sub");
    }

    public String extractRole(String token) {
        return extractClaimString(token, "role");
    }

    public String extractUserId(String token) {
        return extractClaimString(token, "userId");
    }

    public String extractName(String token) {
        return extractClaimString(token, "name");
    }

    public Long extractExpiration(String token) {
        return extractClaimLong(token, "exp");
    }

    private String extractClaimString(String token, String key) {
        String payload = decodePayload(token);
        if (payload == null) return null;
        String pattern = "\"" + key + "\":\"";
        int idx = payload.indexOf(pattern);
        if (idx == -1) return null;
        int start = idx + pattern.length();
        int end = payload.indexOf("\"", start);
        if (end == -1) return null;
        return payload.substring(start, end);
    }

    private Long extractClaimLong(String token, String key) {
        String payload = decodePayload(token);
        if (payload == null) return null;
        String pattern = "\"" + key + "\":";
        int idx = payload.indexOf(pattern);
        if (idx == -1) return null;
        int start = idx + pattern.length();
        int end = start;
        while (end < payload.length() && (Character.isDigit(payload.charAt(end)) || payload.charAt(end) == '-')) {
            end++;
        }
        try {
            return Long.parseLong(payload.substring(start, end));
        } catch (Exception e) {
            return null;
        }
    }

    private String decodePayload(String token) {
        if (token == null) return null;
        String[] parts = token.split("\\.");
        if (parts.length < 2) return null;
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(parts[1]);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error signing JWT with HMAC-SHA256", e);
        }
    }

    private String base64UrlEncode(byte[] input) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(input);
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
