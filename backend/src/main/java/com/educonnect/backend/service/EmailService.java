package com.educonnect.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@educonnect.ac.in}")
    private String fromEmail;

    public boolean sendOtpEmail(String toEmail, String studentName, String otpCode) {
        log.info("==================================================");
        log.info("DISPATCHING OTP EMAIL TO: {} ({})", toEmail, studentName);
        log.info("GENERATED OTP CODE: [ {} ]", otpCode);
        log.info("==================================================");

        try {
            if (mailSender == null) {
                log.info("JavaMailSender is not configured or disabled. OTP code logged above.");
                return true;
            }
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
            if (mailSender == null) {
                log.info("JavaMailSender is not configured or disabled. Password reset code logged above.");
                return true;
            }
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

    public boolean sendAssignmentReminderEmail(String toEmail, String studentName, String subject, String messageText) {
        return sendAssignmentReminderEmail(toEmail, studentName, subject, messageText, null);
    }

    public boolean sendAssignmentReminderEmail(String toEmail, String studentName, String subject, String messageText, String ccEmail) {
        log.info("==================================================");
        log.info("DISPATCHING ASSIGNMENT REMINDER EMAIL TO: {} ({}), CC: {}", toEmail, studentName, ccEmail);
        log.info("SUBJECT: {}", subject);
        log.info("MESSAGE BODY:\n{}", messageText);
        log.info("==================================================");

        try {
            if (mailSender == null) {
                log.info("JavaMailSender is not configured or disabled. Assignment reminder logged above.");
                return true;
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            if (ccEmail != null && !ccEmail.trim().isEmpty()) {
                String[] ccs = ccEmail.split("[,;]");
                for (String c : ccs) {
                    if (c != null && !c.trim().isEmpty()) {
                        helper.addCc(c.trim());
                    }
                }
            }
            helper.setSubject(subject != null && !subject.trim().isEmpty() ? subject : "EduConnect - Assignment Submission Reminder");

            String formattedMessage = messageText != null ? messageText.replace("\n", "<br/>") : "";

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
                        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
                        .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
                        .brand { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: normal; }
                        .brand-blue { color: #2563eb; }
                        .brand-sub { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-top: 4px; }
                        .content { padding: 24px 0; text-align: left; }
                        .title { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
                        .subject-badge { display: inline-block; background: #ef4444; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px; text-transform: uppercase; }
                        .message-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px 20px; font-size: 13px; line-height: 1.6; color: #334155; margin: 16px 0; letter-spacing: normal; }
                        .action-note { font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.5; }
                        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; margin-top: 24px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand">Edu<span class="brand-blue">Connect</span></div>
                            <span class="brand-sub">Official Academic Notification</span>
                        </div>
                        <div class="content">
                            <div class="subject-badge">📌 Assignment Reminder</div>
                            <div class="title">Dear %s,</div>
                            <div class="message-box">%s</div>
                            <div class="action-note">
                                Please log in to your <strong>EduConnect Student Portal</strong> to upload your completed assignment document as soon as possible.
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from your course faculty via EduConnect System.</p>
                            <p>© %d EduConnect Educational Management System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(studentName, formattedMessage, java.time.Year.now().getValue());

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Assignment Reminder Email successfully sent to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.warn("SMTP Assignment Reminder Email delivery failed (using fallback logger): {}", e.getMessage());
            return false;
        }
    }
}
