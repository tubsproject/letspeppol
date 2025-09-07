import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { parseDocument } from '../../src/parse.js';

describe('parseInvoice function', () => {
  const invoiceXml = readFileSync('__tests__/fixtures/invoice.xml', 'utf-8');
  const parsed = parseDocument(invoiceXml);
  it ('should correctly parse sender and recipient from invoice XML', () => {
    expect(parsed).toEqual({
      recipient: "0208:0705969661",
      sender: "0208:1023290711",
    });
  });
});
