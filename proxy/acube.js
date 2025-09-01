
// curl -i -X POST --data-binary "@./example.xml" -H "Authorization: Bearer $ACUBE_TOKEN" -H "Content-Type: application/xml" https://peppol-sandbox.api.acubeapi.com/invoices/outgoing/ubl
export async function sendInvoice(invoiceXml) {
  const response = await fetch('https://peppol-sandbox.api.acubeapi.com/invoices/outgoing/ubl', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ACUBE_TOKEN}`,
      'Content-Type': 'application/xml'
    },
    body: invoiceXml
  });
  console.log('Response from A-Cube', response.status);
}
