import { XMLParser } from 'fast-xml-parser';

export function parseInvoice(invoiceXml: string): { sender: string | undefined; recipient: string | undefined; } {
  const parserOptions = {
    ignoreAttributes: false,
    numberParseOptions: {
      leadingZeros: false,
      hex: true,
      skipLike: /(?:)/ // Disable number parsing
    }
  };
  const parser = new XMLParser(parserOptions);
  const jObj = parser.parse(invoiceXml);
  const sender = jObj['Invoice']?.['cac:AccountingSupplierParty']?.['cac:Party']?.['cbc:EndpointID'];
  const recipient = jObj['Invoice']?.['cac:AccountingCustomerParty']?.['cac:Party']?.['cbc:EndpointID'];

  return {
    sender: `${sender['@_schemeID']}:${sender['#text']}`,
    recipient: `${recipient['@_schemeID']}:${recipient['#text']}`
  };
}