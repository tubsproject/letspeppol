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

export async function listOurEntities(): Promise<number> {
  const response = await fetch('https://peppol-sandbox.api.acubeapi.com/legal-entities', {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  return response.status; 
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

export async function listOurInvoices(page: number, senderId: string): Promise<number> {
  const response = await fetch(`https://peppol-sandbox.api.acubeapi.com/invoices?page=${page}&senderId=${senderId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
    },
  });
  console.log('Response from A-Cube', response.status, response.headers);
  const responseBody = await response.json();
  console.log('Response body from A-Cube', responseBody);
  console.log('Invoices', JSON.stringify(responseBody['hydra:member'].map(item => {
    return {
      uuid: item.uuid,
      sender: item.sender?.identifier,
      recipient: item.recipient?.identifier,
      direction: item.direction,
    };
  }), null, 2));
  return response.status; 
}