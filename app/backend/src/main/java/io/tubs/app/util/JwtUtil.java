package io.tubs.app.util;

import io.tubs.app.config.SecurityConfig;
import io.tubs.app.exception.AppException;
import io.tubs.app.exception.AppErrorCodes;

import org.springframework.security.oauth2.jwt.Jwt;

public class JwtUtil {

    public static String getPeppolId(Jwt jwt) {
        String peppolId = jwt.getClaim(SecurityConfig.PEPPOL_ID);
        if (peppolId == null || peppolId.isBlank()) {
            throw new AppException(AppErrorCodes.PEPPOL_ID_NOT_PRESENT);
        }
        return peppolId;
    }

}
