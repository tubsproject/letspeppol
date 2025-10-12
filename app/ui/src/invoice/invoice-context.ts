import {IEventAggregator, observable, singleton} from "aurelia";
import {CreditNote, CreditNoteLine, getLines, Invoice, InvoiceLine, PaymentMeansCode, UBLDoc} from "../peppol/ubl";
import {CompanyService} from "../services/company-service";
import {resolve} from "@aurelia/kernel";
import {InvoiceComposer} from "./invoice-composer";
import {InvoiceCalculator} from "./invoice-calculator";
import {AlertType} from "../alert/alert";

export enum DocumentType {
    Invoice = "Invoice",
    CreditNote = "Credit Note"
}

// export interface PaymentMeansCode {
//     code: number
//     name: string;
// }

@singleton()
export class InvoiceContext {
    private readonly ea: IEventAggregator = resolve(IEventAggregator);
    private readonly companyService = resolve(CompanyService);
    private readonly invoiceComposer = resolve(InvoiceComposer);
    private readonly invoiceCalculator = resolve(InvoiceCalculator);
    invoices : undefined | Invoice[] | CreditNote[];
    lines : undefined | InvoiceLine[] | CreditNoteLine[];
    @observable selectedInvoice:  undefined | Invoice | CreditNote;

    clearSelectedInvoice() {
        this.selectedInvoice = undefined;
    }

    selectedInvoiceChanged(newValue: UBLDoc) {
        this.lines = getLines(newValue);
    }

    async initCompany() {
        if (!this.companyService.myCompany) {
            try {
                await this.companyService.getAndSetMyCompanyForToken();
            } catch {
                this.ea.publish('alert', {alertType: AlertType.Danger, text: "Failed to get company info"});
            }
        }
    }

    async newUBLDocument(documentType : DocumentType = DocumentType.Invoice) {
        // await this.initCompany();
        if (documentType === DocumentType.Invoice) {
            this.selectedInvoice = this.invoiceComposer.createInvoice();
        } else {
            this.selectedInvoice = this.invoiceComposer.createCreditNote();
        }

        const line: InvoiceLine = this.invoiceComposer.getInvoiceLine("1");
        line.InvoicedQuantity.value = 2;
        line.Item.Description = "item";
        line.Price.PriceAmount.value = 5.33;
        line.LineExtensionAmount.value = 10.66;

        const jop = this.selectedInvoice as Invoice;
        jop.ID = "INV-2025-0001";
        jop.BuyerReference = "PO-12345";
        jop.AccountingCustomerParty.Party.EndpointID.value = "0705969661";
        jop.AccountingCustomerParty.Party.PartyName.Name = "Ponder Source";
        jop.InvoiceLine.push(line);
        jop.PaymentMeans.PayeeFinancialAccount.Name = "Software Oplossing";
        jop.PaymentMeans.PayeeFinancialAccount.ID = "BE123457807";
        this.invoiceCalculator.calculateTaxAndTotals(this.selectedInvoice);
    }

    getNextPosition(): string {
        return "1";
    }

    public paymentMeansCodes: PaymentMeansCode[] = [
        { value: 10, __name: "In Cash"},
        { value: 30, __name: "Credit Transfer"}
    ];
}
