import {resolve} from "@aurelia/kernel";
import {KYCApi} from "./api/kyc-api";
import {SignatureAlgorithm} from "@web-eid/web-eid-library/models/SignatureAlgorithm";

export interface TokenVerificationResponse {
    email: string;
    company: KycCompanyResponse;
}

export interface KycCompanyResponse {
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

export interface PrepareSigningRequest {
    emailToken: string,
    directorId: number,
    certificate: string,
    supportedSignatureAlgorithms: Array<SignatureAlgorithm>,
    language: string,
}

export interface PrepareSigningResponse {
    hashToSign: string,
    hashToFinalize: string,
    hashFunction: string
}

export interface FinalizeSigningRequest {
    emailToken: string,
    directorId: number,
    certificate: string,
    signature: string,
    signatureAlgorithm: SignatureAlgorithm,
    hashToSign: string,
    hashToFinalize: string,
    password: string,
}

export class RegistrationService {
    public kycApi = resolve(KYCApi);

    async getCompany(companyNumber: string): Promise<KycCompanyResponse>  {
        const response = await this.kycApi.httpClient.get(`/api/company/${companyNumber}`);
        return response.json();
    }

    async confirmCompany(companyNumber: string, email: string) {
        const body = {
            companyNumber: companyNumber,
            email: email
        };
        const response = await this.kycApi.httpClient.post(`/api/register/confirm-company`, JSON.stringify(body) );
        return response.json();
    }

    async verifyToken(token: string) : Promise<TokenVerificationResponse> {
        const response = await this.kycApi.httpClient.post(`/api/register/verify?token=${token}`);
        return response.json();
    }

    async prepareSign(request: PrepareSigningRequest) : Promise<PrepareSigningResponse> {
        const response = await this.kycApi.httpClient.post(`/api/identity/sign/prepare`, JSON.stringify(request));
        return response.json();
    }

    async finalizeSign(request: FinalizeSigningRequest) : Promise<Response> {
        return await this.kycApi.httpClient.post(`/api/identity/sign/finalize`, JSON.stringify(request));
    }
}
