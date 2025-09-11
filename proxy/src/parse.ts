import { XMLParser } from 'fast-xml-parser';

export function parseDocument(documentXml: string): { sender: string | undefined; recipient: string | undefined; docType: string | undefined } {
  const parserOptions = {
    ignoreAttributes: false,
    numberParseOptions: {
      leadingZeros: false,
      hex: true,
      skipLike: /(?:)/ // Disable number parsing
    }
  };
  const parser = new XMLParser(parserOptions);
  const jObj = parser.parse(documentXml);
  if (!jObj) {
    throw new Error('Failed to parse XML document');
  }
  if (Object.keys(jObj)[0] !== '?xml') {
    throw new Error('Missing top level ?xml declaration');
  }
  const docType = Object.keys(jObj)[1];
  if (!docType) {
    throw new Error('Could not determine document type from XML');
  }
  const sender = jObj[docType]?.['cac:AccountingSupplierParty']?.['cac:Party']?.['cbc:EndpointID'];
  const recipient = jObj[docType]?.['cac:AccountingCustomerParty']?.['cac:Party']?.['cbc:EndpointID'];
  return {
    sender: `${sender['@_schemeID']}:${sender['#text']}`,
    recipient: `${recipient['@_schemeID']}:${recipient['#text']}`,
    docType: docType === 'Invoice' ? 'Invoice' : docType === 'CreditNote' ? 'CreditNote' : undefined,
  };
}