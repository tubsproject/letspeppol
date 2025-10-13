package io.tubs.app.mapper;

import io.tubs.app.dto.InvoiceDraftDto;
import io.tubs.app.model.InvoiceDraft;

public class InvoiceDraftMapper {

    public static InvoiceDraftDto toDto(InvoiceDraft invoiceDraft) {
        return new InvoiceDraftDto(
                invoiceDraft.getId(),
                invoiceDraft.getType(),
                invoiceDraft.getNumber(),
                invoiceDraft.getCustomer(),
                invoiceDraft.getDate(),
                invoiceDraft.getXml()
        );
    }
}
