package io.tubs.kyc.dto;

public record SignatureAlgorithm (
        String hashFunction,
        String paddingScheme,
        String cryptoAlgorithm
) {}
