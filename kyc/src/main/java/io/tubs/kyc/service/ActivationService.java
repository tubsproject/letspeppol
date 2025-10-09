package io.tubs.kyc.service;

import io.tubs.kyc.dto.ConfirmCompanyRequest;
import io.tubs.kyc.dto.TokenVerificationResponse;
import io.tubs.kyc.exception.KycException;
import io.tubs.kyc.model.EmailVerification;
import io.tubs.kyc.repository.EmailVerificationRepository;
import io.tubs.kyc.service.mail.ActivationEmailTemplateProvider;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivationService {

    private final EmailVerificationRepository verificationRepository;
    private final JavaMailSender mailSender;
    private final CompanyService companyService;
    private final ActivationEmailTemplateProvider templateProvider;
    private final SecureRandom random = new SecureRandom();
    private final Duration ttl = Duration.ofHours(2);

    @Value("${app.mail.activation.base-url}")
    private String baseUrl;

    @Value("${app.mail.from:noreply@example.com}")
    private String fromAddress;

    @Transactional
    public void requestActivation(ConfirmCompanyRequest request) {
        if (isVerified(request.companyNumber())) {
            log.warn("User with email {} tried to register for company {}", request.email(), request.companyNumber());
            throw new KycException("Company already registered");
        }
        String token = generateToken();
        EmailVerification verification = new EmailVerification(
                request.email().toLowerCase(),
                request.companyNumber(),
                token,
                Instant.now().plus(ttl)
        );
        verificationRepository.save(verification);
        sendEmail(request.companyNumber(), request.email(), token);
    }

    @Transactional
    public TokenVerificationResponse verify(String token) {
        EmailVerification verification = verificationRepository.findByToken(token).orElseThrow(() -> new KycException("Token not found"));
        if (verification.isVerified()) {
            throw new KycException("Token already verified");
        }
        if (verification.getExpiresAt().isBefore(Instant.now())) {
            throw new KycException("Token expired");
        }
        return new TokenVerificationResponse(
            verification.getEmail(),
            companyService.getByCompanyNumber(verification.getCompanyNumber())
        );
    }

    public void setVerified(String token) {
        EmailVerification verification = verificationRepository.findByToken(token).orElseThrow(() -> new KycException("Token not found"));
        verification.setVerified(true);
        verificationRepository.save(verification);
    }

    public boolean isVerified(String companyNumber) {
        return verificationRepository.findTopByCompanyNumberOrderByCreatedAtDesc(companyNumber)
                .map(EmailVerification::isVerified)
                .orElse(false);
    }

    @Transactional
    public long purgeExpired() {
        List<EmailVerification> expired = verificationRepository.findByVerifiedFalseAndExpiresAtBefore(Instant.now());
        long count = expired.size();
        if (count > 0) {
            verificationRepository.deleteAll(expired);
        }
        return count;
    }

    private String generateToken() {
        byte[] bytes = new byte[24];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void sendEmail(String companyNumber, String to, String token) {
        String activationLink = baseUrl + token;
        try {
            ActivationEmailTemplateProvider.RenderedTemplate tpl = templateProvider.render(companyNumber, activationLink);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false);
            helper.setTo(to);
            helper.setFrom(fromAddress);
            helper.setSubject(tpl.subject());
            helper.setText(tpl.body(), false);
            mailSender.send(message);
            log.info("Sent activation email to {} for company {}", to, companyNumber);
        } catch (Exception e) {
            log.warn("Failed to send email (logging activation link) token={} error={}", token, e.getMessage());
            log.info("Activation link for {} -> {}", to, activationLink);
        }
    }
}
