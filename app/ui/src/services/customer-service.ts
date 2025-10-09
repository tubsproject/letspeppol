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

@singleton()
export class CustomerService {
    private appApi = resolve(AppApi);
}
