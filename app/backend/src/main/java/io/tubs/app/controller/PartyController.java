package io.tubs.app.controller;

import io.tubs.app.dto.PartyDto;
import io.tubs.app.service.PartyService;
import io.tubs.app.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/party")
public class PartyController {

    private final PartyService partyService;

    @GetMapping
    public List<PartyDto> getParties(@AuthenticationPrincipal Jwt jwt) {
        String companyNumber = JwtUtil.getCompanyNumber(jwt);
        return partyService.findByCompanyNumber(companyNumber);
    }

    @PostMapping
    public PartyDto createParty(@AuthenticationPrincipal Jwt jwt, @RequestBody PartyDto partyDto) {
        String companyNumber = JwtUtil.getCompanyNumber(jwt);
        return partyService.createParty(companyNumber, partyDto);
    }
}
