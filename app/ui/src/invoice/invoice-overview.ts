import {resolve} from "@aurelia/kernel";
import {ListItemV1, ProxyService} from "../services/proxy-service";
import {InvoiceContext} from "./invoice-context";
import {parseInvoice} from "../peppol/ubl-parser";


export class InvoiceOverview {
    private letsPeppolService = resolve(ProxyService);
    private invoiceContext = resolve(InvoiceContext);
    all: ListItemV1[] = [];
    incoming: ListItemV1[] = [];
    outgoing: ListItemV1[] = [];
    activeItems: ListItemV1[] = [];
    box = 'all'
    page = 1;

    attached() {
        this.loadInvoices();
        this.invoiceContext.initCompany();
    }

    loadInvoices() {
        const ip = this.letsPeppolService.getIncomingInvoices(this.page).then(items => this.incoming = items);
        const op = this.letsPeppolService.getOutgoingInvoices(this.page).then(items => this.outgoing = items);
        Promise.all([ip, op]).then(([incoming, outgoing]) => {
            this.all = [...incoming, ...outgoing].sort((a, b) => Date.parse(b.requestSentAt) - Date.parse(a.requestSentAt));
            this.setActiveItems('all');
        });
    }

    setActiveItems(box) {
        this.box = box;
        switch (box) {
            case 'all':
                this.activeItems = this.all;
                break;
            case 'outgoing':
                this.activeItems = this.outgoing;
                break;
            case 'incoming':
                this.activeItems = this.incoming;
                break;
        }
    }

    selectItem(item: ListItemV1) {
        this.letsPeppolService.getDocument(item.type, item.direction, item.uuid).then((doc) => {
            const invoice = parseInvoice(doc);
            this.invoiceContext.selectedInvoice = invoice;
        });
    }

    nextPage() {
        if (this.page > 1 && this.all.length === 0) {
            return;
        }
        this.page++;
        this.loadInvoices();
    }

    previousPage() {
        if (this.page === 1) {
            return;
        }
        this.page--;
        this.loadInvoices();
    }
}
