package com.educonnect.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@educonnect.ac.in}")
    private String fromEmail;

    public boolean sendOtpEmail(String toEmail, String studentName, String otpCode) {
        log.info("==================================================");
        log.info("DISPATCHING OTP EMAIL TO: {} ({})", toEmail, studentName);
        log.info("GENERATED OTP CODE: [ {} ]", otpCode);
        log.info("==================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("EduConnect - Your Login Verification OTP Code");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
                        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                        .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
                        .brand { font-size: 24px; font-weight: 800; color: #1e293b; }
                        .brand-blue { color: #2563eb; }
                        .brand-teal { color: #14b8a6; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-top: 2px; }
                        .content { padding: 24px 0; text-align: center; }
                        .title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
                        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
                        .otp-box { background: #f8fafc; border: 2px dashed #2563eb; border-radius: 12px; padding: 16px 24px; display: inline-block; margin: 16px 0; }
                        .otp-code { font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: 8px; }
                        .expiry-note { font-size: 12px; color: #f97316; margin-top: 12px; font-weight: 600; }
                        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand">Edu<span class="brand-blue">Connect</span></div>
                            <span class="brand-teal">Academic Portal Authentication</span>
                        </div>
                        <div class="content">
                            <div class="title">Hello %s,</div>
                            <div class="subtitle">Use the verification code below to complete your Student Portal login.</div>
                            <div class="otp-box">
                                <div class="otp-code">%s</div>
                            </div>
                            <div class="expiry-note">⏱️ This code will expire in 5 minutes.</div>
                        </div>
                        <div class="footer">
                            <p>If you did not request this OTP code, please ignore this email.</p>
                            <p>© %d EduConnect Educational Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(studentName, otpCode, java.time.Year.now().getValue());

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP Email successfully sent to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.warn("SMTP Email delivery failed (using fallback logger): {}", e.getMessage());
            return false;
        }
    }

    public boolean sendResetEmail(String toEmail, String recipientName, String resetCode) {
        log.info("==================================================");
        log.info("DISPATCHING PASSWORD RESET CODE TO: {} ({})", toEmail, recipientName);
        log.info("GENERATED RESET CODE: [ {} ]", resetCode);
        log.info("==================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("EduConnect - Password Reset Verification Code");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
                        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                        .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
                        .brand { font-size: 24px; font-weight: 800; color: #1e293b; }
                        .brand-blue { color: #2563eb; }
                        .brand-teal { color: #14b8a6; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-top: 2px; }
                        .content { padding: 24px 0; text-align: center; }
                        .title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
                        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
                        .code-box { background: #f8fafc; border: 2px dashed #14b8a6; border-radius: 12px; padding: 16px 24px; display: inline-block; margin: 16px 0; }
                        .reset-code { font-size: 32px; font-weight: 800; color: #14b8a6; letter-spacing: 8px; }
                        .expiry-note { font-size: 12px; color: #f97316; margin-top: 12px; font-weight: 600; }
                        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand">Edu<span class="brand-blue">Connect</span></div>
                            <span class="brand-teal">Password Reset Request</span>
                        </div>
                        <div class="content">
                            <div class="title">Hello %s,</div>
                            <div class="subtitle">We received a request to reset your EduConnect portal password. Use the verification code below:</div>
                            <div class="code-box">
                                <div class="reset-code">%s</div>
                            </div>
                            <div class="expiry-note">⏱️ This password reset code will expire in 10 minutes.</div>
                        </div>
                        <div class="footer">
                            <p>If you did not request a password reset, please secure your account or ignore this email.</p>
                            <p>© %d EduConnect Educational Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(recipientName, resetCode, java.time.Year.now().getValue());

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Password Reset Email successfully sent to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.warn("SMTP Reset Email delivery failed (using fallback logger): {}", e.getMessage());
            return false;
        }
    }
}
