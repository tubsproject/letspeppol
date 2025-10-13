package io.tubs.app.service;

import io.tubs.app.CompanyRepository;
import io.tubs.app.dto.InvoiceDraftDto;
import io.tubs.app.exception.NotFoundException;
import io.tubs.app.mapper.InvoiceDraftMapper;
import io.tubs.app.model.Company;
import io.tubs.app.model.InvoiceDraft;
import io.tubs.app.repository.InvoiceDraftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Transactional
@Service
public class InvoiceDraftService {

    private final CompanyRepository companyRepository;
    private final InvoiceDraftRepository invoiceDraftRepository;

    public List<InvoiceDraftDto> findByCompanyNumber(String companyNumber) {
        return invoiceDraftRepository.findByOwningCompany(companyNumber).stream()
                .map(InvoiceDraftMapper::toDto)
                .toList();
    }

    public InvoiceDraftDto createDraft(String companyNumber, InvoiceDraftDto draftDto) {
        Company company = companyRepository.findByCompanyNumber(companyNumber).orElseThrow(() -> new NotFoundException("Company does not exist"));
        InvoiceDraft draft = new InvoiceDraft(
                draftDto.type(),
                draftDto.number(),
                draftDto.customer(),
                draftDto.date(),
                draftDto.xml()
        );
        draft.setCompany(company);
        invoiceDraftRepository.save(draft);
        return InvoiceDraftMapper.toDto(draft);
    }

    public InvoiceDraftDto updateDraft(String companyNumber, Long id, InvoiceDraftDto draftDto) {
        InvoiceDraft draft = invoiceDraftRepository.findById(id).orElseThrow(() -> new NotFoundException("Draft does not exist"));
        draft.setType(draftDto.type());
        draft.setNumber(draftDto.number());
        draft.setCustomer(draftDto.customer());
        draft.setDate(draftDto.date());
        draft.setXml(draftDto.xml());
        invoiceDraftRepository.save(draft);
        return InvoiceDraftMapper.toDto(draft);
    }

    public void deleteDraft(Long id, String companyNumber) {
        invoiceDraftRepository.deleteByIdAndCompanyNumber(companyNumber, id);
    }

}
