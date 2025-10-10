package io.tubs.kyc.exception;

public final class KycErrorCodes {
    public static final String COMPANY_ALREADY_REGISTERED = "company_already_registered";
    public static final String TOKEN_NOT_FOUND = "token_not_found";
    public static final String TOKEN_ALREADY_VERIFIED = "token_already_verified";
    public static final String TOKEN_EXPIRED = "token_expired";
    public static final String COMPANY_NOT_FOUND = "company_not_found";
    public static final String CUSTOMER_ALREADY_LINKED = "customer_already_linked";
    public static final String PROXY_REGISTRATION_FAILED = "proxy_registration_failed";
    public static final String KBO_PARSE_ADDRESS_FAILED = "kbo_parse_address_failed";
    public static final String KBO_PARSE_DIRECTORS_FAILED = "kbo_parse_directors_failed";
    public static final String KBO_NOT_FOUND = "kbo_not_found";
    public static final String KBO_SERVICE_ERROR = "kbo_service_error";
    public static final String INVALID_CERTIFICATE = "invalid_certificate";
    public static final String CONTRACT_NOT_FOUND = "contract_not_found";
    // Add more codes as needed
    private KycErrorCodes() {}
}
