import {resolve} from '@aurelia/kernel';
import {singleton} from "aurelia";
import {AppApi} from "./api/app-api";

export interface CompanyResponse {
    name: string,
    companyNumber: string,
    subscriber: string,
    subscriberEmail: string,
    paymentTerms: string,
    iban: string,
    paymentAccountName: string,
    registeredOffice: Address
}

export interface Address {
    city?: string,
    postalCode?: string,
    street?: string,
    houseNumber?: string
}

@singleton()
export class CompanyService {
    private appApi = resolve(AppApi);
    public myCompany: CompanyResponse;

    async getAndSetMyCompanyForToken() : Promise<CompanyResponse> {
        this.myCompany = await this.appApi.httpClient.get(`/api/company`).then(response => response.json());
        return Promise.resolve(this.myCompany);
    }

    async updateCompany(company: CompanyResponse) {
        const response = await this.appApi.httpClient.put(`/api/company`, JSON.stringify(company) );
        this.myCompany = await response.json();
        return Promise.resolve(this.myCompany);
    }

}
