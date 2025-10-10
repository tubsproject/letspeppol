import {singleton} from "aurelia";
import {resolve} from "@aurelia/kernel";
import {AppApi} from "./api/app-api";

@singleton()
export class InvoiceService {
    private appApi = resolve(AppApi);

    async validate(xml: string) : Promise<string> {
        const response = await this.appApi.httpClient.post(`/api/invoice/validate`, JSON.stringify({xml: xml})).then(response => response.json());
        return response;
    }
}
