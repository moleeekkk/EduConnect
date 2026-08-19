package com.educonnect.backend.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class OtpUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Generates a cryptographically secure 6-digit numeric OTP.
     */
    public static String generateSecureOtp() {
        int otpInt = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", otpInt);
    }

    /**
     * Generates a SHA-256 hex hash of the given raw OTP string.
     */
    public static String hashOtp(String rawOtp) {
        if (rawOtp == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawOtp.trim().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
