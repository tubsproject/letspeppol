import { INVOICES, CREDIT_NOTES } from "./constants.js";
import { Backend, ListEntityDocumentsParams, ListItemV1 } from "./Backend.js";
import { parseDocument } from "./parse.js";

export class Peppyrus implements Backend {
  apiUrl = 'https://api.test.peppyrus.be/v1';
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
    console.log(`curl -X POST -H "Content-Type: application/json" -H "X-Api-Key: ${process.env.PEPPYRUS_TOKEN_TEST}" -d '${body}' -i ${this.apiUrl}/message`);
    const response = await fetch(`${this.apiUrl}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.PEPPYRUS_TOKEN_TEST!,
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
    void identifier;



    throw new Error('Method not implemented.');
  }
  async unreg(identifier: string): Promise<void> {
    void identifier;
    throw new Error('Method not implemented.');
  }
  async listEntityDocuments(options: ListEntityDocumentsParams): Promise<object[]> {
    void options;
    const response = await fetch(`${this.apiUrl}/message/list`, {
      headers: {
        'X-Api-Key': process.env.PEPPYRUS_TOKEN_TEST!,
      }
    });
    const { items } = await response.json();
    return items.map((item: any): ListItemV1 => {
      let docType = item.documentType;
      if (docType === `${INVOICES.documentTypeScheme}::${INVOICES.documentType}`) {
        docType = 'Invoice';
      } else if (item.documentType === `${CREDIT_NOTES.documentTypeScheme}::${CREDIT_NOTES.documentType}`) {
        docType = 'CreditNote';
      }
      return {
        uuid: item.id,
        type: docType,
        direction: item.direction == 'OUT' ? 'outgoing' : 'incoming',
        format: item.format,
        number: item.number,
        senderId: item.sender,
        recipientId: item.recipient,
        success: item.folder === 'sent',
        errorCode: null,
      };
    });
  }
  async getDocumentXml({ peppolId, type, uuid }: { peppolId: string; type: string; uuid: string }): Promise<string> {
    void peppolId; void type; void uuid;
    throw new Error('Method not implemented.');
  }
}
