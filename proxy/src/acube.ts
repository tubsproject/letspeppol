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

export async function sendDocument(documentXml: string, sendingEntity: string): Promise<Response> {
  const { sender, docType } = parseDocument(documentXml);
  if (sender !== sendingEntity) {
    console.error(`Sender ${sender} does not match sending entity ${sendingEntity}`);
    return  { status: 400 } as Response;
  }
  const endPoint: Record<string, string> = {
    'Invoice': 'https://peppol-sandbox.api.acubeapi.com/invoices/outgoing/ubl',
    'CreditNote': 'https://peppol-sandbox.api.acubeapi.com/credit-notes/outgoing/ubl',
  };
  if (!docType || !endPoint[docType]) {
    console.error('Could not determine document type or unsupported document type', docType);
    return { status: 400 } as Response;
  }
  return fetch(endPoint[docType], {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Content-Type': 'application/xml'
    },
    body: documentXml
  });
}

export async function getUuid(identifier: string): Promise<string | null> {
  const identifierValue = identifier.split(':')[1];
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/legal-entities?identifierValue=${identifierValue}`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  const responseObj = await response.json();
  if (responseObj['hydra:totalItems'] === 0) {
    return null;
  }
  if (responseObj['hydra:totalItems'] > 1) {
    console.warn('Warning: multiple legal entities found for identifier', identifierValue);
  }
  return responseObj['hydra:member']?.[0]?.uuid || null;
}

export async function createLegalEntity(identifier: string): Promise<Response> {
  return fetch('https://peppol-sandbox.api.acubeapi.com/legal-entities', {
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
}

async function setSmpRecord(identifier: string, enabled: boolean): Promise<Response> {
    const uuid = await getUuid(identifier);
    if (!uuid) {
      console.error('Could not fetch UUID', uuid);
      return { status: 500 } as Response;
    }
    return fetch(`https://peppol-sandbox.api.acubeapi.com/legal-entities/${uuid}/smp`, {
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
}

export async function reg(identifier: string): Promise<Response> {
  const createResult = await createLegalEntity(identifier);
  if (createResult.status === 201 || createResult.status === 202) {
    return setSmpRecord(identifier, true);
  }
  if (createResult.status === 500) {
    console.warn('Assuming legal entity already exists, trying to set SMP record', identifier);
    return setSmpRecord(identifier, true);
  }
  return { status: 400 } as Response;
}

export async function unreg(identifier: string): Promise<Response> {
  return setSmpRecord(identifier, false);
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
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/${type}?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  const responseObj = await response.json();
  const list = responseObj['hydra:member'].map(item => item.uuid);
  return list;
}


export async function getDocumentXml({ peppolId, type, uuid }: { peppolId: string; direction: string; type: string; uuid: string }): Promise<string | null> {
  // FIXME: check that the document with this uuid is actually associated with this peppolId
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/${type}/${uuid}/source`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Accept': 'application/xml',
    },
  });
  const responseBody = await response.text();
  const { sender, recipient } = parseDocument(responseBody);
  if ((sender !== peppolId) && (recipient !== peppolId)) {
    console.error(`Document sender ${sender} and recipient ${recipient} do not match peppolId ${peppolId}`);
    return null;
  }
  return responseBody;
}