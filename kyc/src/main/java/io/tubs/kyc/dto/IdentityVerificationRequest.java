package io.tubs.kyc.dto;

import io.tubs.kyc.model.kbo.Director;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.security.cert.X509Certificate;

public record IdentityVerificationRequest(
        @NotNull String email,
        @NotNull Director director,
        @NotBlank @Size(max = 64) String password,
        @NotBlank @Size(max = 64) String algorithm,
        @NotNull String hashToSign,
        @NotNull String signature,
        @NotNull String certificate,
        @NotNull X509Certificate x509Certificate
) {}

