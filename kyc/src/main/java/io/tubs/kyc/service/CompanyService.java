package io.tubs.kyc.service;

import io.tubs.kyc.dto.CompanyResponse;
import io.tubs.kyc.dto.DirectorDto;
import io.tubs.kyc.exception.NotFoundException;
import io.tubs.kyc.model.kbo.Company;
import io.tubs.kyc.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;

    public CompanyResponse getByCompanyNumber(String companyNumber) {
        Company company = companyRepository.findByCompanyNumber(companyNumber)
                .orElseThrow(() -> new NotFoundException("Company not found"));
        return toResponse(company);
    }

    public CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getCompanyNumber(),
                company.getName(),
                company.getStreet(),
                company.getHouseNumber(),
                company.getCity(),
                company.getPostalCode(),
                company.getDirectors().stream()
                        .map(d -> new DirectorDto(d.getId(), d.getName()))
                        .collect(Collectors.toList())
        );
    }
}
