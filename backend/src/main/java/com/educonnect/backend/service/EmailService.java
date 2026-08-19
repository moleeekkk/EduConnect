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

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Dispatches a real OTP email via SMTP to the student's registered email inbox.
     * Note: Raw OTP is NEVER logged to production log files for security compliance.
     */
    public boolean sendStudentLoginOtp(String toEmail, String studentName, String rawOtp, int expirationMinutes) {
        log.info("Dispatching real OTP email via SMTP to recipient: {}", toEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("EduConnect – Your Student Login OTP");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
                        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                        .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
                        .brand { font-size: 26px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
                        .brand-blue { color: #2563eb; }
                        .portal-tag { color: #14b8a6; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-top: 4px; }
                        .content { padding: 28px 0; text-align: center; }
                        .greeting { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 8px; text-align: left; }
                        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; text-align: left; line-height: 1.5; }
                        .otp-box { background: #f8fafc; border: 2px dashed #2563eb; border-radius: 14px; padding: 20px 28px; display: inline-block; margin: 12px 0 20px 0; }
                        .otp-code { font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; }
                        .expiry-note { font-size: 12px; color: #f97316; font-weight: 600; margin-top: 12px; }
                        .security-warning { font-size: 12px; color: #64748b; background: #fffbebfb; border: 1px solid #fef3c7; padding: 12px; rounded-radius: 8px; margin-top: 16px; text-align: left; border-radius: 8px; }
                        .footer { text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand">Edu<span class="brand-blue">Connect</span></div>
                            <span class="portal-tag">Student Portal Verification</span>
                        </div>
                        <div class="content">
                            <div class="greeting">Hello %s,</div>
                            <div class="subtitle">Your EduConnect Student Portal verification OTP is:</div>
                            <div class="otp-box">
                                <div class="otp-code">%s</div>
                            </div>
                            <div class="expiry-note">⏱️ This OTP is valid for %d minutes.</div>
                            <div class="security-warning">
                                🔒 <strong>Security Notice:</strong> For security reasons, do not share this OTP with anyone. If you did not request this OTP, please ignore this email.
                            </div>
                        </div>
                        <div class="footer">
                            <p>Regards,<br><strong>EduConnect Student Portal Team</strong></p>
                            <p>© %d EduConnect Educational Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(studentName, rawOtp, expirationMinutes, java.time.Year.now().getValue());

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ REAL OTP Email successfully delivered via SMTP to {}", toEmail);
            return true;
        } catch (Exception e) {
            if (e.getMessage() != null && (e.getMessage().contains("Authentication failed") || e.getMessage().contains("535"))) {
                log.error("❌ SMTP Email delivery failed to {}: Authentication failed! Please generate a new 16-character Google App Password for sender ({}) in application.properties", toEmail, fromEmail);
            } else {
                log.error("❌ SMTP Email delivery failed to {}: {}", toEmail, e.getMessage());
            }
            return false;
        }
    }
}
