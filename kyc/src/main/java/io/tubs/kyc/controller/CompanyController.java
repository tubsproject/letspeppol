package io.tubs.kyc.controller;

import io.tubs.kyc.dto.CompanyResponse;
import io.tubs.kyc.exception.NotFoundException;
import io.tubs.kyc.service.CompanyService;
import io.tubs.kyc.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;
    private final JwtService jwtService;

    @GetMapping("/{companyNumber}")
    public CompanyResponse getCompany(@PathVariable String companyNumber) {
         return companyService.getByCompanyNumber(companyNumber).orElseThrow(() -> new NotFoundException("Company not found"));
    }

    @GetMapping
    public ResponseEntity getCompanyForToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        String companyNumber = jwtService.validateToken(token).split(":")[1];
        return ResponseEntity.ok(companyService.getByCompanyNumber(companyNumber));
    }
}
