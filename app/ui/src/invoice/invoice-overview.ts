import {resolve} from "@aurelia/kernel";
import {ProxyService} from "../services/proxy-service";
import {InvoiceContext} from "./invoice-context";

export class InvoiceOverview {
    private letsPeppolService = resolve(ProxyService);
    private invoiceContext = resolve(InvoiceContext);


    attached() {
        this.letsPeppolService.getIncomingInvoices();
        this.letsPeppolService.getOutgoingInvoices();
    }
}