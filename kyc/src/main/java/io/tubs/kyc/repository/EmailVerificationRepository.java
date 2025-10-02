package io.tubs.kyc.repository;

import io.tubs.kyc.model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByToken(String token);
    Optional<EmailVerification> findTopByCompanyNumberOrderByCreatedAtDesc(String companyNumber);
    List<EmailVerification> findByVerifiedFalseAndExpiresAtBefore(Instant cutoff);
}
