export type ListEntityDocumentsParams = {
  peppolId: string;
  direction: 'incoming' | 'outgoing';
  type: 'invoices' | 'credit-notes';
  query: Record<string, string | string[] | undefined>;
};


export abstract class Backend {
  abstract sendDocument(documentXml: string, sendingEntity: string): Promise<void>;  
  abstract getUuid(identifier: string): Promise<string>;
  abstract createLegalEntity(identifier: string): Promise<void>;
  abstract reg(identifier: string): Promise<void>;
  abstract unreg(identifier: string): Promise<void>;
  abstract listEntityDocuments(options: ListEntityDocumentsParams): Promise<object[]>;
  abstract getDocumentXml({ peppolId, type, uuid }: { peppolId: string; type: string; uuid: string }): Promise<string>;
}