import {singleton} from "aurelia";
import {resolve} from "@aurelia/kernel";
import {AppApi} from "./api/app-api";
import {Address} from "./company-service";

export interface CustomerResponse {
    name: string,
    companyNumber?: string,
    iban?: string,
    paymentAccountName?: string,
    registeredOffice?: Address
}

export interface PartnerResponse {
    id?: number,
    companyNumber: string,
    name: string,
    email: string,
    customer: boolean,
    supplier: boolean,

    paymentTerms: string,
    iban: string,
    paymentAccountName: string

    registeredOffice?: Address
}

@singleton()
export class PartnerService {
    private appApi = resolve(AppApi);

    async getPartners() : Promise<PartnerResponse[]> {
        return await this.appApi.httpClient.get('/api/partner').then(response => response.json());
    }

    async createPartner(partner: PartnerResponse) : Promise<PartnerResponse> {
        return await this.appApi.httpClient.post('/api/partner', JSON.stringify(partner)).then(response => response.json());
    }

    async updatePartner(id: number, partner: PartnerResponse) : Promise<PartnerResponse> {
        return await this.appApi.httpClient.put(`/api/partner/${id}`, JSON.stringify(partner)).then(response => response.json());
    }

    async deletePartner(id:number) {
        return await this.appApi.httpClient.delete(`/api/partner/${id}`);
    }
}
