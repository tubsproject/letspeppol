import {Params, RouteNode} from "@aurelia/router";
import {resolve} from "@aurelia/kernel";
import {
    RegistrationService,
    TokenVerificationResponse,
    Director
} from "../services/registration-service";
import * as webeid from '@web-eid/web-eid-library/web-eid';
import {KYCApi} from "../services/api/kyc-api";
import {IEventAggregator} from "aurelia";
import {AlertType} from "../alert/alert";


export class EmailConfirmation {
    readonly ea: IEventAggregator = resolve(IEventAggregator);
    readonly kycApi = resolve(KYCApi);
    readonly registrationService = resolve(RegistrationService);
    public errorMessage: string | undefined; // made public for template binding
    public emailToken: string;
    public tokenVerificationResponse: TokenVerificationResponse | undefined; // made public for template binding
    public confirmedDirector: Director | undefined; // holds the chosen director
    private password;
    private passwordDuplicate;
    private registrationSuccess = true;
    private agreedToContract = false;
    private step = 0;

    public loading(params: Params, next: RouteNode) {
        this.emailToken = next.queryParams.get('token');
        if (!this.emailToken) {
            this.errorMessage = 'Token not available';
            return;
        }
        this.registrationService.verifyToken(this.emailToken).then(result => {
            this.tokenVerificationResponse = result;
            this.step = 1;
        }).catch(error => {
            this.ea.publish('alert', {alertType: AlertType.Danger, text: "Token invalid"});
        });
    }

    getContractUrl() {
        return `${this.kycApi.httpClient.baseUrl}/api/register/contract`;
    }

    public async confirmContract() {
        try {
            const {
                certificate,
                supportedSignatureAlgorithms
            } = await webeid.getSigningCertificate({lang: 'en'});

            const signatureAlgorithm = supportedSignatureAlgorithms.find(item => item.hashFunction === "SHA-256");

            const prepareSigningRequest = {
                emailToken: this.emailToken,
                directorId: this.confirmedDirector.id,
                certificate: certificate,
                supportedSignatureAlgorithms: supportedSignatureAlgorithms,
                language: 'en'
            };
            const prepareSigningResponse = await this.registrationService.prepareSign(prepareSigningRequest);
            console.log(prepareSigningResponse);
            console.log(signatureAlgorithm);

            const signResponse = await webeid.sign(
                certificate,
                prepareSigningResponse.hashToSign,
                signatureAlgorithm.hashFunction
            );
            console.log(signResponse);

            const finalizeSigningRequest = {
                emailToken: this.emailToken,
                directorId: this.confirmedDirector.id,
                certificate: certificate,
                signature: signResponse.signature,
                signatureAlgorithm: signResponse.signatureAlgorithm,
                hashToSign: prepareSigningResponse.hashToSign,
                hashToFinalize: prepareSigningResponse.hashToFinalize,
                password: this.password
            };
            const response = await this.registrationService.finalizeSign(finalizeSigningRequest);
            console.log(response);
            this.step = 3;
            await this.downloadFile(response);
            this.ea.publish('alert', {alertType: AlertType.Success, text: "Signed contract downloaded!"});
        } catch (error) {
            const json = await error.json();
            this.ea.publish('alert', {alertType: AlertType.Danger, text: json ? json.message : "Signing failed"}); // TODO error util
        }

    }

    async downloadFile(response: Response) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "contract_signed.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    public async confirmDirector(director: Director) {
        if (this.confirmedDirector) return; // already confirmed one
        this.confirmedDirector = director;
        this.step = 2;
        return;
    }
}
