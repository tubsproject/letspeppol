package io.tubs.kyc.exception;

public class KycException extends RuntimeException {
    private final String code;

    public KycException(String code) {
        super(code);
        this.code = code;
    }

    public KycException(String code, String message) {
        super(message);
        this.code = code;
    }

    public KycException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
