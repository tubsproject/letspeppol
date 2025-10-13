import {bindable} from "aurelia";
import {Party} from "../../../peppol/ubl";
import {PartnerDto} from "../../../services/partner-service";

export class InvoiceCustomerModal {
    @bindable invoiceContext;
    @bindable customerSearch;
    open = false;
    customer: Party | undefined;

    vatChanged() {
        if (!this.customer) return;
        this.customer.EndpointID.value = this.customer.PartyIdentification[0].ID.value;
        this.customer.PartyTaxScheme.CompanyID.value = `BE${this.customer.PartyIdentification[0].ID.value}`;
    }

    showModal() {
        this.customer = JSON.parse(JSON.stringify(this.invoiceContext.selectedInvoice.AccountingCustomerParty.Party));
        this.open = true;
        this.customerSearch.resetSearch();
        this.customerSearch.focusInput();
    }

    closeModal() {
        this.open = false;
        this.customer = undefined;
        this.customerSearch.resetSearch();
    }

    saveCustomer() {
        this.open = false;
        this.invoiceContext.selectedInvoice.AccountingCustomerParty.Party = this.customer;
        this.customerSearch.resetSearch();
    }

    selectCustomer(c: PartnerDto) {
        this.customer = this.toParty(c);
    }

    private toParty(c: PartnerDto): Party {
        const companyNumber = c.companyNumber || '';
        return {
            EndpointID: { value: companyNumber },
            PartyIdentification: [{ ID: { value: companyNumber } }],
            PartyName: { Name: c.name },
            PostalAddress: {
                StreetName: [c.registeredOffice?.street, c.registeredOffice?.houseNumber].filter(Boolean).join(' '),
                CityName: c.registeredOffice?.city,
                PostalZone: c.registeredOffice?.postalCode,
                Country: { IdentificationCode: 'BE' }
            },
            PartyTaxScheme: { CompanyID: { value: `BE${companyNumber}` }, TaxScheme: { ID: 'VAT' } },
            PartyLegalEntity: { RegistrationName: c.name, CompanyID: { value: companyNumber } },
            Contact: { Name: c.paymentAccountName }
        };
    }
}
