import { parseDocument } from './parse.js';

const INVOICES = {
  "documentTypeScheme": "busdox-docid-qns",
  "documentType": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2::Invoice##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1",
  "processScheme": "cenbii-procid-ubl",
  "process": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
};
const CREDIT_NOTES = {
  "documentTypeScheme": "busdox-docid-qns",
  "documentType": "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2::CreditNote##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1",
  "processScheme": "cenbii-procid-ubl",
  "process": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
};

async function fetchSmpRecord(uuid: string): Promise<any> {
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/legal-entities/${uuid}/smp`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  return responseBody;
}

async function putSmpRecord(uuid: string, enabled: boolean): Promise<any> {
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/legal-entities/${uuid}/smp`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      enabled,
      capabilities: [
        INVOICES,
        CREDIT_NOTES,
      ],
    }),
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  return responseBody;
}

export async function sendDocument(documentXml: string, sendingEntity: string): Promise<number> {
  const { sender, recipient, docType } = parseDocument(documentXml);
  if (sender !== sendingEntity) {
    console.error(`Sender ${sender} does not match sending entity ${sendingEntity}`);
    return 400;
  }
  console.log(`Parsed document, docType: ${docType}, sender OK: ${sender}, recipient: ${recipient}`);
  const endPoint: Record<string, string> = {
    'Invoice': 'https://peppol-sandbox.api.acubeapi.com/invoices/outgoing/ubl',
    'CreditNote': 'https://peppol-sandbox.api.acubeapi.com/credit-notes/outgoing/ubl',
  };
  if (!docType || !endPoint[docType]) {
    console.error('Could not determine document type or unsupported document type', docType);
    return 400;
  }
  const response = await fetch(endPoint[docType], {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Content-Type': 'application/xml'
    },
    body: documentXml
  });
  const responseBody = await response.text();
  console.log('Response from A-Cube', response.status, response.headers, responseBody);
  return response.status;
}

export async function getUuid(identifier: string): Promise<string | null> {
  const identifierValue = identifier.split(':')[1];
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/legal-entities`/*?identifierValue=${identifierValue}`*/, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  void identifierValue;
  return responseBody['hydra:member']?.[0]?.uuid || null;
}

export async function createLegalEntity(identifier: string): Promise<number> {
  const response = await fetch('https://peppol-sandbox.api.acubeapi.com/legal-entities', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Content-Type': 'application/ld+json'
    },
    body: JSON.stringify({
      "registeredName": "Ponder Source",
      "country": "SE",
      "address": "string",
      "city": "string",
      "stateOrProvince": "string",
      "zipCode": "string",
      "identifierScheme": "iso6523-actorid-upis",
      "identifierValue": identifier,
      "receivedDocumentNotificationEmails": [
        "notif@pondersource.com"
      ]
    })
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  return response.status;  
}

export async function setSmpRecord(identifier: string, enabled: boolean): Promise<number> {
    console.log('Fetching UUID');
    const uuid = await getUuid(identifier);
    if (!uuid) {
      console.log('Could not fetch UUID', uuid);
      return 500;
    }
    const smpRecord = await fetchSmpRecord(uuid);
    console.log('Fetched SMP record, now updating', smpRecord);
    const response = await putSmpRecord(uuid, enabled);
    console.log('Updated SMP record', response);
    return 200;
}

export async function register(identifier: string): Promise<number> {
  const createResult = await createLegalEntity(identifier);
  if (createResult === 201 || createResult === 202) {
    return setSmpRecord(identifier, true);
  }
  if (createResult === 500) {
    console.log('Assuming legal entity already exists, trying to set SMP record', identifier);
    return setSmpRecord(identifier, true);
  }
  return 400;
}

export async function unreg(identifier: string): Promise<number> {
  const uuid = await getUuid(identifier);
  console.log('deleting legal entity', uuid);
  const response = await putSmpRecord(uuid!, false);
  console.log('Updated SMP record', response);
  return 200;  
}

export type ListEntityDocumentsParams = {
  peppolId: string;
  direction: 'incoming' | 'outgoing';
  type: 'invoices' | 'credit-notes';
  query: Record<string, string | string[] | undefined>;
};
export async function listEntityDocuments(options: ListEntityDocumentsParams): Promise<object[]> {
  const { peppolId, direction, type, query } = options;
  if (!peppolId.startsWith('0208:')) {
    throw new Error('Only organization number (scheme 0208) is supported as peppolId');
  }
  console.log('listing entity documents', peppolId, direction, type, query);
  const params = { direction };
  if (direction === 'outgoing') {
    params['senderId'] = peppolId.substring('0208:'.length);
    if (query['recipientId']) {
      params['recipientId'] = query['recipientId'];
    }
  } else {
    params['recipientId'] = peppolId.substring('0208:'.length);
    if (query['senderId']) {
      params['senderId'] = query['senderId'];
    }
  }
  // preserve the order of the other allowed query parameters as much as possible
  Object.keys(query).forEach(queryKey => {
    if (['page', 'itemsPerPage', 'senderName', 'recipientName', 'documentNumber', 'sortBy[createdAt]', 'sortBy[documentDate]', 'sortBy[senderName]', 'sortBy[recipientName]', 'createdAt[before]', 'documentDate[before]', 'downloaded'].includes(queryKey)) {
      params[queryKey] = query[queryKey];
    }
  });
  const queryString = new URLSearchParams(params).toString();
  console.log('Query string', options.query, queryString);
  console.log(`https://peppol-sandbox.api.acubeapi.com/${type}?${queryString}`);
  // const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/${type}?createdAt[after]=2025-01-01&documentDate[after]=2025-01-01`, {
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/${type}?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseObj = await response.json();
  console.log('Response body from A-Cube', JSON.stringify(responseObj, null, 2));
  const list = responseObj['hydra:member'].map(item => item.uuid);
  console.log('Invoice UUIDs', JSON.stringify(list, null, 2));
  return list;
}


export async function getDocumentXml({ peppolId, direction, type, uuid }: { peppolId: string; direction: string; type: string; uuid: string }): Promise<string | null> {
  console.log('fetching document xml', peppolId, direction, type, uuid);
  // FIXME: check that the document with this uuid is actually associated with this peppolId
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/${type}/${uuid}/source`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Accept': 'application/xml',
    },
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.text();
  console.log('Response body from A-Cube', responseBody);
  return responseBody;
}