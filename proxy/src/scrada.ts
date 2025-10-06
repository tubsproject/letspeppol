import { INVOICES, CREDIT_NOTES, ID_SCHEME } from "./constants.js";
import { Backend, ListEntityDocumentsParams } from "./Backend.js";
import { parseDocument } from "./parse.js";

function toScrada(docSpec: { documentTypeScheme: string; documentType: string; processScheme: string; process: string }) {
  return {
    "scheme": docSpec.documentTypeScheme,
    "value": docSpec.documentType,
    "processIdentifier": {
      "scheme": docSpec.processScheme,
      "value": docSpec.process
    }
  };
}

export class Scrada implements Backend {
  apiUrl = 'https://apitest.scrada.be';
  async sendDocument(documentXml: string, sendingEntity: string): Promise<void> {
    const { sender, recipient } = parseDocument(documentXml);
    if (sender !== sendingEntity) {
      throw new Error(`Sender ${sender} does not match sending entity ${sendingEntity}`);
    }
    const body = JSON.stringify({
      sender,
      recipient,
      processType: `${INVOICES.processScheme}::${INVOICES.process}`,
      documentType: `${INVOICES.documentTypeScheme}::${INVOICES.documentType}`,
      fileName: 'invoice.xml',
      "fileContent": Buffer.from(documentXml).toString('base64'),
    });
    const response = await fetch(`${this.apiUrl}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.SCRADA_API_KEY!,
        'X-Password': process.env.SCRADA_API_PWD!,
      },
      body
    });
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Failed to send document, status code ${response.status}: ${await response.text()}`);
    }
  }
  async getUuid(identifier: string): Promise<string> {
    void identifier;
    throw new Error('Method not implemented.');
  }
  async createLegalEntity(identifier: string): Promise<void> {
    void identifier;
    throw new Error('Method not implemented.');
  }
  async reg(identifier: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/v1/company/${process.env.SCRADA_COMPANY_ID}/peppol/register`, {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.SCRADA_API_KEY!,
        'X-Password': process.env.SCRADA_API_PWD!,
      },
      body: JSON.stringify({
        participantIdentifier: {
          scheme: ID_SCHEME,
          id: identifier
        },
        migrationKey: null,
        businessEntity: {
          name: "{{businessEntityName}}",
          languageCode: "NL",
          countryCode: "{{businessEntityCountry}}"
        },
        documentTypes: [ toScrada(INVOICES), toScrada(CREDIT_NOTES) ],
      }),
    });
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Failed to register company, status code ${response.status}: ${await response.text()}`);
    }
  }
  async unreg(identifier: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/v1/company/${process.env.SCRADA_COMPANY_ID}/peppol/deregister/${ID_SCHEME}//${identifier}`, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': process.env.SCRADA_API_KEY!,
        'X-Password': process.env.SCRADA_API_PWD!,
      },
    });
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Failed to deregister company, status code ${response.status}: ${await response.text()}`);
    }
  }
  async listEntityDocuments(options: ListEntityDocumentsParams): Promise<object[]> {
    void options;
    const response = await fetch(`${this.apiUrl}/v1/company/${options.peppolId}/peppol/inbound/document/unconfirmed`, {
      headers: {        
        'X-Api-Key': process.env.SCRADA_API_KEY!,
        'X-Password': process.env.SCRADA_API_PWD!,
      }
    });
    return [ response.text() ];
    // const { items } = await response.json();
    // return items.map((item: any): ListItemV1 => {
    //   let docType = item.documentType;
    //   if (docType === `${INVOICES.documentTypeScheme}::${INVOICES.documentType}`) {
    //     docType = 'Invoice';
    //   } else if (item.documentType === `${CREDIT_NOTES.documentTypeScheme}::${CREDIT_NOTES.documentType}`) {
    //     docType = 'CreditNote';
    //   }
    //   return {
    //     uuid: item.id,
    //     type: docType,
    //     direction: item.direction == 'OUT' ? 'outgoing' : 'incoming',
    //     format: item.format,
    //     number: item.number,
    //     senderId: item.sender,
    //     recipientId: item.recipient,
    //     success: item.folder === 'sent',
    //     errorCode: null,
    //   };
    // });
  }
  async getDocumentXml({ peppolId, type, uuid }: { peppolId: string; type: string; uuid: string }): Promise<string> {
    void peppolId;
    void type;
    const response = await fetch(`${this.apiUrl}/message/${uuid}`, {
      headers: {
        'X-Api-Key': process.env.PEPPYRUS_TOKEN_TEST!,
      }
    });
    if (response.status !== 200) {
      throw new Error(`Failed to retrieve document XML, status code ${response.status}: ${await response.text()}`);
    }
    const { fileContent } = await response.json();
    return Buffer.from(fileContent, 'base64').toString('utf-8');
  }
}
