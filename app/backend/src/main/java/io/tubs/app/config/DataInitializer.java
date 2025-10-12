package io.tubs.app.config;

import io.tubs.app.CompanyRepository;
import io.tubs.app.dto.AddressDto;
import io.tubs.app.dto.AppRegistrationRequest;
import io.tubs.app.dto.PartnerDto;
import io.tubs.app.service.CompanyService;
import io.tubs.app.service.PartnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Component
public class DataInitializer implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final CompanyService companyService;
    private final PartnerService partnerService;

    @Override
    @Transactional
    public void run(String... args) {
        String companyNumber = "0705969661";
        if (companyRepository.findByCompanyNumber(companyNumber).isEmpty()) {
            AppRegistrationRequest registrationRequest = new AppRegistrationRequest(
                    companyNumber,
                    "Digita bv.",
                    "Demerstraat",
                    "2",
                    "Hasselt",
                    "3500",
                    "Michiel Wouters",
                    "michiel@digita.be"
            );
            companyService.register(registrationRequest);
            PartnerDto partner = new PartnerDto(
                    null,
                    "BE123456789",
                    "John Doe",
                    "john@doe.com",
                    true,
                    false,
                    "Last day 30 days",
                    "BE12345678900",
                    "1000",
                    new AddressDto(null,"Bree", "3960", "Kerkstraat", "15")
            );
            partnerService.createPartner(companyNumber, partner);
            PartnerDto partner2 = new PartnerDto(
                    null,
                    "BE987654321",
                    "Jane Smith",
                    "jane@smith.com",
                    true,
                    false,
                    "First day 60 days",
                    "BE98765432100",
                    "2000",
                    new AddressDto(null,"Genk", "3600", "Stationsstraat", "22")
            );
            partnerService.createPartner(companyNumber, partner2);

        }
        companyNumber = "1023290711";
        if (companyRepository.findByCompanyNumber(companyNumber).isEmpty()) {
            AppRegistrationRequest registrationRequest = new AppRegistrationRequest(
                    companyNumber,
                    "SoftwareOplossing bv.",
                    "Demerstraat",
                    "2",
                    "Hasselt",
                    "3500",
                    "Bart In stukken",
                    "bart@softwareoplossing.be"
            );
            companyService.register(registrationRequest);
        }
    }
}
