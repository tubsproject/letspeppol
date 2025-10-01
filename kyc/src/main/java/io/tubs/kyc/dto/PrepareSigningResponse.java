package io.tubs.kyc.dto;

public record PrepareSigningResponse(
        String hashToSign,
        String hashToFinalize,
        String hashFunction
)
{}
