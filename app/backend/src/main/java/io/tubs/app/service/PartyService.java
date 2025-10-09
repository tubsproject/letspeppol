package io.tubs.app.service;

import io.tubs.app.CompanyRepository;
import io.tubs.app.dto.PartyDto;
import io.tubs.app.exception.NotFoundException;
import io.tubs.app.mapper.PartyMapper;
import io.tubs.app.model.Company;
import io.tubs.app.model.Party;
import io.tubs.app.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PartyService {

    private final CompanyRepository companyRepository;
    private final PartyRepository partyRepository;

    public PartyDto createParty(String companyNumber, PartyDto partyDto) {
        Company company = companyRepository.findByCompanyNumber(companyNumber).orElseThrow(() -> new NotFoundException("Company does not exist"));
        Party party = new Party(
                partyDto.companyNumber(),
                partyDto.name(),
                partyDto.email(),
                partyDto.customer(),
                partyDto.supplier(),
                partyDto.paymentTerms(),
                partyDto.iban(),
                partyDto.paymentAccountName(),
                partyDto.registeredOffice().city(),
                partyDto.registeredOffice().postalCode(),
                partyDto.registeredOffice().street(),
                partyDto.registeredOffice().houseNumber()
        );
        party.setCompany(company);
        partyRepository.save(party);
        return PartyMapper.toDto(party);
    }

    public List<PartyDto> findByCompanyNumber(String companyNumber) {
        return partyRepository.findByCompanyNumber(companyNumber).stream()
                .map(PartyMapper::toDto)
                .toList();
    }



}
