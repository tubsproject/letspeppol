package io.tubs.kyc.controller;

import io.tubs.kyc.dto.*;
import io.tubs.kyc.service.IdentityVerificationService;
import io.tubs.kyc.service.SigningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/identity")
@RequiredArgsConstructor
public class IdentityVerificationController {

    private final SigningService signingService;

    /**
     * Step 1: prepare signing
     */
    @PostMapping("/sign/prepare")
    public PrepareSigningResponse prepare(@RequestBody PrepareSigningRequest request) {
        return signingService.prepareSigning(request);
    }

    /**
     * Step 2: finalize signing
     */
    @PostMapping("/sign/finalize")
    public ResponseEntity finalize(@RequestBody FinalizeSigningRequest request) {
        byte[] data = signingService.finalizeSign(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contract_signed.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
