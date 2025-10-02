import {singleton} from "aurelia";
import {
    getLines,
    TaxSubtotal,
    UBLDoc,
} from "../peppol/peppol-ubl";

@singleton
export class InvoiceCalculator {

    public calculateTaxAndTotals(doc: UBLDoc) {
        let lines = getLines(doc);

        let taxTotal = 0;
        let totalWithoutTax = 0;
        let taxSubtotals: TaxSubtotal[] = [];
        for (let line of lines) {
            let taxSubtotal = taxSubtotals.find(item => item.TaxCategory.ID === line.Item.ClassifiedTaxCategory.ID);
            if (!taxSubtotal) {
                taxSubtotal = {
                    TaxableAmount: {
                        value: 0,
                        __currencyID: "EUR"
                    },
                    TaxAmount: {
                        value: 0,
                        __currencyID: "EUR"
                    },
                    TaxCategory: {
                        ID: line.Item.ClassifiedTaxCategory.ID,
                        Percent: line.Item.ClassifiedTaxCategory.Percent,
                        TaxScheme: {
                            ID: line.Item.ClassifiedTaxCategory.TaxScheme.ID
                        }
                    }
                }
                taxSubtotals.push(taxSubtotal);
            }
            taxSubtotal.TaxableAmount.value += line.LineExtensionAmount.value;
            totalWithoutTax += line.LineExtensionAmount.value;
            const tax = this.roundTwoDecimals(line.LineExtensionAmount.value * (line.Item.ClassifiedTaxCategory.Percent / 100.0));
            taxSubtotal.TaxAmount.value += tax;
            taxTotal += tax;
        }

        doc.TaxTotal = [{
            TaxAmount: {
                __currencyID: "EUR",
                value: taxTotal
            },
            TaxSubtotal: taxSubtotals
        }];

        doc.LegalMonetaryTotal = {
            LineExtensionAmount: {
                __currencyID: "EUR",
                value: totalWithoutTax
            },
            TaxExclusiveAmount: {
                __currencyID: "EUR",
                value: totalWithoutTax
            },
            TaxInclusiveAmount: {
                __currencyID: "EUR",
                value: totalWithoutTax + taxTotal
            },
            PayableAmount: {
                __currencyID: "EUR",
                value: totalWithoutTax + taxTotal
            }
        };
    }

    roundTwoDecimals(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }
}