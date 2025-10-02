import {route} from "@aurelia/router";
import {resolve} from "@aurelia/kernel";
import {Login} from "../login/login";
import {Registration} from "../registration/registration";
import {EmailConfirmation} from "../registration/email-confirmation";
import {Alert} from "../alert/alert";

@route({
    routes: [
        { path: ['', '/login'],        component: Login,                title: 'Login',                 data: { allowEveryone: true }},
        { path: '/registration',       component: Registration,         title: 'Registration',          data: { allowEveryone: true }},
        { path: '/email-confirmation', component: EmailConfirmation,    title: 'Email Confirmation',    data: { allowEveryone: true }},
    ],
})
export class LetsPeppol {
    private alert = resolve(Alert);
}
