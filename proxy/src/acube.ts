import { parseInvoice } from './parse.js';
  
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

export async function getUuid(identifierValue: string): Promise<string | null> {
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

export async function register(identifier): Promise<number> {
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
export async function unreg(identifier: string): Promise<number> {
  const identifierValue = identifier.split(':')[1];
  const uuid = await getUuid(identifierValue);
  console.log('deleting legal entity', uuid);
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/legal-entities/${uuid}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`
    }
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  return response.status;  
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