import { INVOICES } from "./constants.js";
import { Backend, ListEntityDocumentsParams } from "./Backend.js";

export class Peppyrus implements Backend {
  async sendDocument(documentXml: string, sendingEntity: string): Promise<void> {
    const body = JSON.stringify({
      sender: sendingEntity,
      recipient: "9925:be0123456789",
      processType: `${INVOICES.processScheme}::${INVOICES.process}`,
      documentType: `${INVOICES.documentTypeScheme}::${INVOICES.documentType}`,
      "fileContent": documentXml
    });
    const response = await fetch('https://api.peppyrus.com/v1/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PEPPYRUS_TOKEN}`,
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
    throw new Error('Method not implemented.');
  }
  async getDocumentXml({ peppolId, type, uuid }: { peppolId: string; type: string; uuid: string }): Promise<string> {
    void peppolId; void type; void uuid;
    throw new Error('Method not implemented.');
  }
}
