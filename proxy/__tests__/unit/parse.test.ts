import { describe, it, beforeEach, afterAll, vi, expect } from 'vitest';
import { readFileSync } from 'fs';
import { parseInvoice } from '../../src/parse.js';

describe('parseInvoice function', () => {
  const invoiceXml = readFileSync('__tests__/fixtures/invoice.xml', 'utf-8');
  const parsed = parseInvoice(invoiceXml);
  it ('should correctly parse sender and recipient from invoice XML', () => {
    expect(parsed).toEqual({
      recipient: "0208:0705969661",
      sender: "0208:1023290711",
    });
  });
});
