import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { parseDocument } from '../../src/parse.js';

describe('parseDocument function', () => {
  const invoiceXml = readFileSync('__tests__/fixtures/invoice.xml', 'utf-8');
  const invoiceAcubeXml = readFileSync('__tests__/fixtures/invoice-acube.xml', 'utf-8');
  const creditNoteXml = readFileSync('__tests__/fixtures/credit-note.xml', 'utf-8');
  const creditNoteAcubeXml = readFileSync('__tests__/fixtures/credit-note-acube.xml', 'utf-8');

  it ('should correctly parse sender and recipient from invoice XML', () => {
    const parsed = parseDocument(invoiceXml);
    expect(parsed).toEqual({
      recipient: "0208:0705969661",
      sender: "9944:nl862637223B02",
      docType: "Invoice",
    });
  });
  it ('should correctly parse sender and recipient from A-Cube style invoice XML', () => {
    const parsed = parseDocument(invoiceAcubeXml);
    expect(parsed).toEqual({
      recipient: "0208:0705969661",
      sender: "0208:1023290711",
      docType: "Invoice",
    });
  });
  it ('should correctly parse sender and recipient from credit note XML', () => {
    const parsed = parseDocument(creditNoteXml);
    expect(parsed).toEqual({
      recipient: "0208:0705969661",
      sender: "0208:1023290711",
      docType: "CreditNote",
    });
  });
  it ('should correctly parse sender and recipient from A-Cube style credit note XML', () => {
    const parsed = parseDocument(creditNoteAcubeXml);
    expect(parsed).toEqual({
      recipient: "0208:0705969661",
      sender: "0208:1023290711",
      docType: "CreditNote",
    });
  });
});
