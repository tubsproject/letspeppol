package io.tubs.app.controller;

import io.tubs.app.service.ValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {
    private final ValidationService validationService;

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, Object> map) {
        String xml = (String) map.get("xml");
        if (xml == null || xml.isBlank()) {
            return ResponseEntity.badRequest().body("Missing XML content");
        }
        Map<String, Object> response = validationService.validateXml(xml);
        return ResponseEntity.ok(response);
    }
}
