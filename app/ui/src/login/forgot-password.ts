import {resolve} from "@aurelia/kernel";
import {ForgotPasswordRequest, RegistrationService} from "../services/kyc/registration-service";

export class ForgotPassword {
    readonly registrationService = resolve(RegistrationService);
    requestSent = false;
    email;
    error;

    async forgotPassword() {
        const request = {
            email: this.email,
        } as ForgotPasswordRequest;
        try {
            await this.registrationService.forgotPassword(request);
            this.error = false;
            this.requestSent = true;
        } catch (e) {
            this.error = true;
        }
    }
}
