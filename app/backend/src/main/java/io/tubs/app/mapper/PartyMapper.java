package io.tubs.app.mapper;

import io.tubs.app.dto.PartyDto;
import io.tubs.app.model.Party;

public class PartyMapper {

    public static PartyDto toDto(Party party) {
        return new PartyDto(
                party.getCompanyNumber(),
                party.getName(),
                party.getEmail(),
                party.getCustomer(),
                party.getSupplier(),
                party.getPaymentTerms(),
                party.getIban(),
                party.getPaymentAccountName(),
                AddressMapper.toDto(party.getRegisteredOffice())
        );
    }

}
