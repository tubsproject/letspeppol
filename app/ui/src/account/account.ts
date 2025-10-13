import {CompanyDto, CompanyService} from "../services/company-service";
import {resolve} from "@aurelia/kernel";
import {AlertType} from "../alert/alert";
import {IEventAggregator} from "aurelia";

export class Account {
    private readonly ea: IEventAggregator = resolve(IEventAggregator);
    private readonly companyService = resolve(CompanyService);
    private company: CompanyDto;

    attached() {
        this.getCompany().catch(() => {
            this.ea.publish('alert', {alertType: AlertType.Danger, text: "Failed to get account"});
        });
    }

    async getCompany() {
        let company = this.companyService.myCompany;
        if (!company) {
            company = await this.companyService.getAndSetMyCompanyForToken().then(result => this.company = result);
        }
        this.company = JSON.parse(JSON.stringify(company));
    }

    async saveAccount() {
        try {
            this.ea.publish('showOverlay', "Saving...");
            await this.companyService.updateCompany(this.company);
            this.ea.publish('alert', {alertType: AlertType.Success, text: "Account updated successfully"});
        } catch(e) {
            console.error(e);
            this.ea.publish('alert', {alertType: AlertType.Danger, text: "Failed to update account"});
        } finally {
            this.ea.publish('hideOverlay');
        }
    }

    discardChanges() {
        this.company = JSON.parse(JSON.stringify(this.companyService.myCompany));
        this.ea.publish('alert', {alertType: AlertType.Info, text: "Account changes reverted"});
    }
}
