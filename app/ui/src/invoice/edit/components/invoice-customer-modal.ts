import {bindable} from "aurelia";

export class InvoiceCustomerModal {
    @bindable invoiceContext;
    open = false;

    showModal() {
        this.open = true;
    }

    closeModal() {
        this.open = false;
    }
}