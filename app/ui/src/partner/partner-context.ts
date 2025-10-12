import {bindable, singleton} from "aurelia";
import {PartnerResponse} from "../services/partner-service";

@singleton
export class PartnerContext {
    @bindable selectedPartner: PartnerResponse | undefined = undefined;
    partners: PartnerResponse[] = [];
    filteredPartners: PartnerResponse[] = [];

    newPartner() {
        this.selectedPartner = {
            companyNumber: "",
            name: "",
            email: "",
            customer: true,
            supplier: false,

            paymentAccountName: "",
            iban: "",
            paymentTerms: "",

            registeredOffice: {}
        };
    }

    clearSelectedPartner() {
        this.selectedPartner = undefined;
    }

    replacePartner(currentPartner: PartnerResponse, newPartner: PartnerResponse) {
        let index = this.partners.findIndex(item => item === currentPartner);
        if (index > -1) {
            this.partners.splice(index, 1, newPartner);
        }
        index = this.filteredPartners.findIndex(item => item === currentPartner);
        if (index > -1) {
            this.filteredPartners.splice(index, 1, newPartner);
        }
    }

    addPartner(partner) {
        this.partners.unshift(partner);
    }

    deletePartner(partner) {
        const index = this.partners.findIndex(item => item === partner);
        if (index > -1) {
            this.partners.splice(index, 1);
        }
    }
}