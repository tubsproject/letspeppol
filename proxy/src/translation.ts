import { components as acube } from './acube.d.js';
import { components as ion } from './ion.d.js';
// import { components as arratech } from './arratech.d.js';
// import { components as maventa } from './maventa.d.js';
import { components as peppyrus } from './peppyrus.d.js';
import { operations as recommand } from './recommand.d.js';
import { components as front } from './front.d.js';

export type AcubeDocument =
  | acube['schemas']['Invoice.InvoiceOutput.jsonld']
  | acube['schemas']['CreditNote.CreditNoteOutput.jsonld'];
export type PeppyrusDocument = peppyrus['schemas']['Message'];
export type IonDocument =
  | ion['schemas']['SendTransaction']
  | ion['schemas']['ReceiveTransaction'];
// export type ArratechDocument = arratech["schemas"]["FromNetwork"] | arratech["schemas"]["ToNetwork"];
// export type MaventaDocument = maventa["schemas"]["Invoice"];
export type RecommandDocument =
  recommand['getDocuments']['responses'][200]['content']['application/json']['documents'][number];
export type FrontDocument = front['schemas']['Document'];

const DOC_TYPE_MAP: { [key: string]: 'invoice' | 'credit-note' } = {
  'busdox-docid-qns::urn:oasis:names:specification:ubl:schema:xsd:Invoice-2::Invoice##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1':
    'invoice',
  'busdox-docid-qns::urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2::CreditNote##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1':
    'credit-note',
};
const DIRECTION_MAP: { [key: string]: 'incoming' | 'outgoing' } = {
  OUT: 'outgoing',
  IN: 'incoming',
};

function mapDocType(docType: string | undefined): 'invoice' | 'credit-note' {
  if (typeof DOC_TYPE_MAP[docType || ''] === 'undefined') {
    throw new Error(`Unknown docType: ${docType}`);
  }
  return DOC_TYPE_MAP[docType || ''];
}
function mapDirection(direction: string | undefined): 'incoming' | 'outgoing' {
  if (typeof DIRECTION_MAP[direction || ''] === 'undefined') {
    throw new Error(`Unknown direction: ${direction}`);
  }
  return DIRECTION_MAP[direction || ''];
}

export function fromAcube(
  item: AcubeDocument,
  context: { docType: 'invoice' | 'credit-note' },
): FrontDocument {
  console.log('Inserting Acube document...', item);
  return {
    platformId: `acube:${item.uuid}`,
    docType: mapDocType(context.docType),
    direction: mapDirection(item.direction),
    senderId: item.sender?.identifier!,
    receiverId: item.recipient?.identifier!,
    createdAt: item.createdAt!,
  };
}

function fromPeppyrus(item: PeppyrusDocument): FrontDocument {
  return {
    platformId: `peppyrus:${item.id}`,
    docType: mapDocType(item.documentType),
    direction: mapDirection(item.direction),
    senderId: item.sender!,
    receiverId: item.recipient!,
    createdAt: item.created!,
  };
}

export function fromIon(
  item: IonDocument,
  context: { direction: 'incoming' | 'outgoing' },
): FrontDocument {
  return {
    platformId: `ion:${item.id}`,
    docType: mapDocType(item.document_element),
    direction: context.direction,
    senderId: item.sender_identifier,
    receiverId: item.receiver_identifier,
    createdAt: item.created_on,
  };
}

export function fromRecommand(
  item: RecommandDocument,
  context: { direction: 'incoming' | 'outgoing' },
): FrontDocument {
  return {
    platformId: `recommand:${item.id}`,
    docType: DOC_TYPE_MAP[item.docTypeId] || 'unknown',
    direction: context.direction,
    senderId: item.senderId,
    receiverId: item.receiverId,
    createdAt: item.createdAt,
  };
}

export const translationFunctions = {
  acube_invoice: { fn: fromAcube, context: { docType: 'invoice' } },
  acube_creditnote: { fn: fromAcube, context: { docType: 'creditnote' } },
  peppyrus_message: { fn: fromPeppyrus, context: {} },
  ion_sendTransactions: { fn: fromIon, context: { direction: 'outgoing' } },
  ion_receiveTransactions: { fn: fromIon, context: { direction: 'incoming' } },
  // arratech_fromnetwork: null, // No translation function, handled separately
  // arratech_tonetwork: null, // No translation function, handled separately
  // maventa_invoices: null, // No translation function, handled separately
  recommand_documents: {
    fn: fromRecommand,
    context: { direction: 'outgoing' },
  },
  recommand_inbox: { fn: fromRecommand, context: { direction: 'incoming' } },
};
