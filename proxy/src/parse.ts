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
  if (sender['@_schemeID'] !== 'iso6523-actorid-upis') {
    throw new Error(`Unsupported sender schemeID ${sender['@_schemeID']}, only iso6523-actorid-upis is supported`);
  }
  if (recipient['@_schemeID'] !== 'iso6523-actorid-upis') {
    throw new Error(`Unsupported recipient schemeID ${recipient['@_schemeID']}, only iso6523-actorid-upis is supported`);
  }
  if (!sender['#text']) {
    throw new Error('Missing sender EndpointID text');
  }
  if (!recipient['#text']) {
    throw new Error('Missing recipient EndpointID text');
  }
  return {
    sender: sender['#text'],
    recipient: recipient['#text'],
    docType: docType === 'Invoice' ? 'Invoice' : docType === 'CreditNote' ? 'CreditNote' : undefined,
  };
}