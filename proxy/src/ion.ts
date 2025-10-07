// import { INVOICES, CREDIT_NOTES, ID_SCHEME } from "./constants.js";
import { Backend, ListEntityDocumentsParams } from "./Backend.js";
// import { parseDocument } from "./parse.js";

export class Ion implements Backend {
  async reg(identifier: string): Promise<void> {
    void identifier;
    throw new Error('Method not implemented.');
  }
  async unreg(identifier: string): Promise<void> {
    void identifier;
    throw new Error('Method not implemented.');
  }
  async sendDocument(documentXml: string, sendingEntity: string): Promise<void> {
    void documentXml;
    void sendingEntity;
    throw new Error('Method not implemented.');
  }
  async listEntityDocuments(options: ListEntityDocumentsParams): Promise<object[]> {
    void options;
    throw new Error('Method not implemented.');
  }
  async getDocumentXml(query: { peppolId: string; type: string; uuid: string, direction: string }): Promise<string> {
    void query;
    throw new Error('Method not implemented.');
  }

}