package io.tubs.kyc.repository;

import io.tubs.kyc.model.CustomerIdentityVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerIdentityVerificationRepository extends JpaRepository<CustomerIdentityVerification, Long> {
    List<CustomerIdentityVerification> findByCustomerId(Long customerId);
}

