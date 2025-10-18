import {Params, RouteNode, Router} from "@aurelia/router";
import {resolve} from "@aurelia/kernel";
import {RegistrationService, ResetPasswordRequest} from "../services/kyc/registration-service";

export class ResetPassword {
    readonly registrationService = resolve(RegistrationService);
    readonly router = resolve(Router);
    error: boolean = false;
    token: string;
    password: string;
    confirmPassword: string;

    public loading(params: Params, next: RouteNode) {
        this.token = next.queryParams.get('token');
    }

    async resetPassword() {
        const request = {
            token: this.token,
            newPassword: this.password,
        } as ResetPasswordRequest;
        try {
            await this.registrationService.resetPassword(request);
            await this.router.load('login')
        } catch (e) {
            this.error = true;
        }
    }

}
