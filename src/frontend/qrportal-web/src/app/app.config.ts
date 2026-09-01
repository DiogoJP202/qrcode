import { registerLocaleData } from "@angular/common";
import localePt from "@angular/common/locales/pt";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { apiInterceptor } from "./core/api.interceptor";
import { routes } from "./app.routes";

// Registrar os dados não troca o locale ativo: sem LOCALE_ID, `currency` formata
// em en-US e os preços saem como R$26.00. Fica aqui para valer também no SSR.
registerLocaleData(localePt, "pt-BR");

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: "pt-BR" },
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: "enabled" })),
  ],
};
