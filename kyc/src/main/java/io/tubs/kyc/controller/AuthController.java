package io.tubs.kyc.controller;

import io.tubs.kyc.model.Customer;
import io.tubs.kyc.service.CustomerService;
import io.tubs.kyc.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping("/api/jwt")
@RequiredArgsConstructor
public class AuthController {

    public final static String EAS_ONDERNEMINGSNUMMER = "0208";

    private final JwtService jwtService;
    private final CustomerService customerService;

    @PostMapping("/auth")
    public ResponseEntity<String> auth(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String base64Credentials = authHeader.substring("Basic ".length()).trim();
        byte[] credDecoded = Base64.getDecoder().decode(base64Credentials.getBytes(StandardCharsets.UTF_8));
        String credentials = new String(credDecoded, StandardCharsets.UTF_8);

        final String[] values = credentials.split(":", 2);
        if (values.length != 2) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Basic authentication format");
        }
        String email = values[0];
        String password = values[1];
        Customer customer = customerService.findCustomerWithCredentials(email, password);

        String token = jwtService.generateToken(EAS_ONDERNEMINGSNUMMER + ":" + customer.getCompany().getCompanyNumber());

        return ResponseEntity.ok(token);
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateToken(@RequestParam String peppolId) {
        String token = jwtService.generateToken(peppolId);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestParam String token) {
        String peppolId = jwtService.validateToken(token);
        if (peppolId == null) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        return ResponseEntity.ok(peppolId);
    }
}
