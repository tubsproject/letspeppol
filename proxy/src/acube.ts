
// curl -i -X POST --data-binary "@./example.xml" -H "Authorization: Bearer $ACUBE_TOKEN" -H "Content-Type: application/xml" https://peppol-sandbox.api.acubeapi.com/invoices/outgoing/ubl
export async function sendInvoice(invoiceXml): Promise<number> {
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