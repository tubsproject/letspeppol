import { INVOICES } from "./constants.js";
import { Backend, ListEntityDocumentsParams } from "./Backend.js";

export class Peppyrus implements Backend {
  apiUrl = 'https://api.test.peppyrus.be/v1';
  async sendDocument(documentXml: string, sendingEntity: string): Promise<void> {
    void sendingEntity;
    const body = JSON.stringify({
      sender: "9944:nl862637223B01",
      recipient: "9944:nl862637223B01",
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
    console.log(response.status, await response.text());
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
    return response.json();
  }
  async getDocumentXml({ peppolId, type, uuid }: { peppolId: string; type: string; uuid: string }): Promise<string> {
    void peppolId; void type; void uuid;
    throw new Error('Method not implemented.');
  }
}
