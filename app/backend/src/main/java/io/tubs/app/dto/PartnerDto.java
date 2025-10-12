package io.tubs.app.dto;

public record PartnerDto(
    Long id,
    String companyNumber,
    String name,
    String email,
    Boolean customer,
    Boolean supplier,

    String paymentTerms,
    String iban,
    String paymentAccountName,
    AddressDto registeredOffice
)
{}
