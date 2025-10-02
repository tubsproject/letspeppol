import {resolve} from "@aurelia/kernel";
import {CompanyResponse, CompanyService} from "../services/company-service";
import {RegistrationService} from "../services/registration-service";
import {AlertType} from "../alert/alert";
import {IEventAggregator} from "aurelia";

export class Registration {
    readonly ea: IEventAggregator = resolve(IEventAggregator);
    private companyService = resolve(CompanyService);
    private registrationService = resolve(RegistrationService);
    step = 0;
    email: string | undefined;
    companyNumber : string | undefined;
    company : CompanyResponse | undefined;

    async checkCompanyNumber() {
        try {
            this.company = await this.companyService.getCompany(this.companyNumber);
            this.step++;
        } catch {
            this.ea.publish('alert', {alertType: AlertType.Danger, text: "Token invalid"});
        }
    }

    restart(e) {
        this.companyNumber = undefined;
        this.company = undefined;
        this.step = 0;
        e.preventDefault();
    }

    async confirmCompany() {
        try {
            await this.registrationService.confirmCompany(this.companyNumber, this.email);
            this.step++;
        } catch {
            this.ea.publish('alert', {alertType: AlertType.Danger, text: "Company already registered"});
        }
    }

}