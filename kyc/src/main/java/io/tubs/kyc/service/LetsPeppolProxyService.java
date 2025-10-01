package io.tubs.kyc.service;

import io.tubs.kyc.exception.KycException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@RequiredArgsConstructor
@Service
public class LetsPeppolProxyService {

    @Value("${proxy.enabled:false}")
    private boolean proxyEnabled;
    private final WebClient webClient;

    public void registerCompany(String token) {
        if (!proxyEnabled) {
            return;
        }
        try {
            ResponseEntity<String> response = this.webClient.post()
                    .uri("/reg")
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .toEntity(String.class)
                    .block();
        } catch (Exception ex) {
            log.error("Registering company to proxy failed", ex);
            throw new KycException("Registering company to proxy failed");
        }
    }

}
