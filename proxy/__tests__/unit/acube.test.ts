import { readFileSync } from 'fs';
import { test, vi, expect, MockedFunction } from 'vitest';
import { Acube } from '../../src/acube.js';

test('sends document successfully', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 202,
    }),
  ) as unknown as MockedFunction<typeof fetch>;

  const acube = new Acube();
  // Call the function and assert the result
  const invoiceXml = readFileSync('__tests__/fixtures/invoice.xml', 'utf-8');
  await acube.sendDocument(invoiceXml, '0208:1023290711');

  // Check that fetch was called exactly once
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith('https://peppol-sandbox.api.acubeapi.com/invoices/outgoing/ubl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      Authorization: `Bearer ${process.env.ACUBE_TOKEN}`,
    },
    body: invoiceXml,
  });
});