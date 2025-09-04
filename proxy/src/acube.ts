import { parseInvoice } from './parse.js';

const CAPABILITIES = {
  "documentTypeScheme": "busdox-docid-qns",
  "documentType": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2::Invoice##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1",
  "processScheme": "cenbii-procid-ubl",
  "process": "cenbii-procid-ubl urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
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
      capabilities: [CAPABILITIES],
    }),
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  return responseBody;
}

export async function sendInvoice(invoiceXml: string, sendingEntity: string): Promise<number> {
  const { sender, recipient } = parseInvoice(invoiceXml);
  if (sender !== sendingEntity) {
    console.error(`Sender ${sender} does not match sending entity ${sendingEntity}`);
    return 400;
  }
  console.log(`Parsed invoice, sender OK: ${sender}, recipient: ${recipient}`);
  const response = await fetch('https://peppol-sandbox.api.acubeapi.com/invoices/outgoing/ubl', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Content-Type': 'application/xml'
    },
    body: invoiceXml
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

async function setSmpRecord(identifier: string, enabled: boolean): Promise<number> {
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
    await setSmpRecord(identifier, true);
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

export async function listOurInvoices(page: number, recipientId: string): Promise<object[]> {
  void page;
  void recipientId;
  console.log('filtering on recipientId', recipientId);
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/invoices?recipientId=${recipientId.split(':')[1]}&direction=incoming`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  const list = responseBody['hydra:member'].map(item => item.uuid);
  console.log('Invoice UUIDs', JSON.stringify(list, null, 2));
  return list;
}


export async function getInvoiceXml(peppolId: string, uuid: string): Promise<string | null> {
  console.log('fetching invoice xml', peppolId, uuid);
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/invoices/${uuid}/source`, {
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