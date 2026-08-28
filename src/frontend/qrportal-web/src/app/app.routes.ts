import { Routes } from "@angular/router";
import { authGuard } from "./core/auth.guard";

export const routes: Routes = [
  { path: "", loadComponent: () => import("./features/marketing/landing.page").then((m) => m.LandingPage) },
  { path: "sobre", loadComponent: () => import("./features/marketing/content.page").then((m) => m.ContentPage), data: { page: "sobre" } },
  { path: "como-funciona", loadComponent: () => import("./features/marketing/content.page").then((m) => m.ContentPage), data: { page: "como-funciona" } },
  { path: "clientes", loadComponent: () => import("./features/marketing/content.page").then((m) => m.ContentPage), data: { page: "clientes" } },
  { path: "planos", loadComponent: () => import("./features/marketing/content.page").then((m) => m.ContentPage), data: { page: "planos" } },
  { path: "contato", loadComponent: () => import("./features/marketing/content.page").then((m) => m.ContentPage), data: { page: "contato" } },
  { path: "login", loadComponent: () => import("./features/auth/auth.page").then((m) => m.AuthPage), data: { mode: "login" } },
  { path: "cadastro", loadComponent: () => import("./features/auth/auth.page").then((m) => m.AuthPage), data: { mode: "register" } },
  { path: "confirmar-email", loadComponent: () => import("./features/auth/account-action.page").then((m) => m.AccountActionPage), data: { mode: "confirm" } },
  { path: "esqueci-senha", loadComponent: () => import("./features/auth/account-action.page").then((m) => m.AccountActionPage), data: { mode: "forgot" } },
  { path: "redefinir-senha", loadComponent: () => import("./features/auth/account-action.page").then((m) => m.AccountActionPage), data: { mode: "reset" } },
  { path: "m/:slug", loadComponent: () => import("./features/public-menu/public-menu.page").then((m) => m.PublicMenuPage) },
  {
    path: "app",
    canActivate: [authGuard],
    loadComponent: () => import("./features/dashboard/dashboard-shell.component").then((m) => m.DashboardShellComponent),
    children: [
      { path: "", pathMatch: "full", loadComponent: () => import("./features/dashboard/overview.page").then((m) => m.OverviewPage) },
      { path: "onboarding", loadComponent: () => import("./features/onboarding/onboarding.page").then((m) => m.OnboardingPage) },
      { path: "editor", loadComponent: () => import("./features/editor/editor.page").then((m) => m.EditorPage) },
      { path: "**", redirectTo: "" },
    ],
  },
  { path: "**", redirectTo: "" },
];
