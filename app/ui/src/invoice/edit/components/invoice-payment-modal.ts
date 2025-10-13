import {bindable} from "aurelia";
import {PaymentMeans} from "../../../peppol/ubl";

export class InvoicePaymentModal {
    @bindable invoiceContext;
    @bindable selectedPaymentMeansCode;
    open = false;
    paymentMeans: PaymentMeans | undefined;

    showModal() {
        this.paymentMeans = JSON.parse(JSON.stringify(this.invoiceContext.selectedInvoice.PaymentMeans));
        this.open = true;
    }

    closeModal() {
        this.open = false;
    }

    savePaymentMeans() {
        this.open = false;
        this.invoiceContext.selectedInvoice.PaymentMeans = this.paymentMeans;
    }

    paymentMeansCodeChanged() {
        if (!this.selectedPaymentMeansCode) {
            this.paymentMeans = null;
            return;
        }
        const paymentMeansCode = this.invoiceContext.paymentMeansCodes.find(item => item.value === this.invoiceContext.selectedInvoice.PaymentMeans.PaymentMeansCode.value);
        this.invoiceContext.selectedInvoice.PaymentMeans.PaymentMeansCode.__name = paymentMeansCode.__name;
    }
}
