package io.tubs.app.dto;

public record InvoiceDraftDto(
        Long id,
        String type, // invoice/credit-note
        String number, // INV-2025-001
        String customer,
        String date,
        String xml
) {
}
