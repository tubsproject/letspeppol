import {valueConverter} from "aurelia";

@valueConverter('price')
export class PriceConverter {
    toView(value: number) {
        if (!value) {
            return '';
        }
        return Intl.NumberFormat('nl-BE', {style: 'currency', currencyDisplay: "symbol"})
    }
}
