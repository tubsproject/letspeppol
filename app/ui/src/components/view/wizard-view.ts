import {resolve} from "@aurelia/kernel";
import {IRouter} from "@aurelia/router";

export class WizardView {
    private readonly router: IRouter = resolve(IRouter);
    private logo: string = 'logo.png';

    attached() {
        this.logo = document.documentElement.getAttribute('data-theme') === 'dark' ? 'logo-dark.png' : 'logo.png';
    }

    goHome() {
        this.router.load('/');
    }
}
