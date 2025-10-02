import {resolve} from "@aurelia/kernel";
import {ProxyApi} from "./api/proxy-api";

export class ProxyService {
    private letsPeppolApi = resolve(ProxyApi);

    async getIncomingInvoices() {
        return await this.letsPeppolApi.httpClient.get('/invoices/incoming');
    }

    async getOutgoingInvoices() {
        return await this.letsPeppolApi.httpClient.get('/invoices/outgoing');
    }

    async sendDocument(xml: string) {
        return await this.letsPeppolApi.httpClient.post('/send', xml);
    }

}