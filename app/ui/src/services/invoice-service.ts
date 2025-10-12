import {singleton} from "aurelia";
import {resolve} from "@aurelia/kernel";
import {AppApi} from "./api/app-api";

export interface InvoiceDraftDto {
    id?: number,
    type: string,
    number?: string,
    customer?: string,
    date?: string,
    xml: string
}

@singleton()
export class InvoiceService {
    private appApi = resolve(AppApi);

    async validate(xml: string) : Promise<string> {
        const response = await this.appApi.httpClient.post(`/api/invoice/validate`, JSON.stringify({xml: xml})).then(response => response.json());
        return response;
    }

    // Drafts

    async getInvoiceDrafts() : Promise<InvoiceDraftDto[]> {
        return await this.appApi.httpClient.get('/api/invoice/draft').then(response => response.json());
    }

    async createInvoiceDraft(draft: InvoiceDraftDto) : Promise<InvoiceDraftDto> {
        return await this.appApi.httpClient.post('/api/invoice/draft', JSON.stringify(draft)).then(response => response.json());
    }

    async updateInvoiceDraft(id: number, draft: InvoiceDraftDto) : Promise<InvoiceDraftDto> {
        return await this.appApi.httpClient.put(`/api/invoice/draft/${id}`, JSON.stringify(draft)).then(response => response.json());
    }

    async deleteInvoiceDraft(id:number) {
        return await this.appApi.httpClient.delete(`/api/invoice/draft/${id}`);
    }
}
