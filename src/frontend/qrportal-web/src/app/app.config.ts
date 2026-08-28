import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { apiInterceptor } from "./core/api.interceptor";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: "enabled" })),
  ],
};
