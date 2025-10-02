import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';
import {singleton} from "aurelia";
import {KYCApi} from "./api/kyc-api";

export interface CompanyResponse {
    id: number,
    companyNumber: string,
    name: string;
    street: string;
    city: string;
    postalCode: string;
    directors?: Director[];
}

export interface Director {
    id: number;
    name: string;
}

@singleton()
export class CompanyService {
    public kycApi = resolve(KYCApi);
    public myCompany: CompanyResponse;

    async getCompany(companyNumber: string): Promise<CompanyResponse>  {
        const response = await this.kycApi.httpClient.get(`/api/company/${companyNumber}`);
        return response.json();
    }

    async getAndSetMyCompanyForToken() : Promise<void> {
        const response = await this.kycApi.httpClient.get(`/api/company`);
        this.myCompany = await response.json();
    }

}