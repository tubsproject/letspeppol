import {resolve} from "@aurelia/kernel";
import {CompanyResponse} from "./company-service";
import {KYCApi} from "./api/kyc-api";
import {SignatureAlgorithm} from "@web-eid/web-eid-library/models/SignatureAlgorithm";

export interface TokenVerificationResponse {
    email: string;
    company: CompanyResponse;
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
