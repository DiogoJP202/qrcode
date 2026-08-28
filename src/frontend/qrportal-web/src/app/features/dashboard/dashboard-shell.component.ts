import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { LucideCreditCard, LucideLayoutDashboard, LucideLogOut, LucideMenu, LucidePackage, LucidePalette, LucideQrCode, LucideSettings, LucideStore, LucideUserRound, LucideX } from "@lucide/angular";
import { AuthService } from "../../core/auth.service";
import { BrandComponent } from "../../shared/brand.component";

@Component({
  selector: "app-dashboard-shell",
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideCreditCard, LucideLayoutDashboard, LucideLogOut, LucideMenu, LucidePackage, LucidePalette, LucideQrCode, LucideSettings, LucideStore, LucideUserRound, LucideX, BrandComponent],
  template: `
    <div class="min-h-screen bg-[#f5f7f6] lg:grid lg:grid-cols-[260px_1fr]">
      <aside class="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:sticky lg:top-0 lg:w-auto" [class.-translate-x-full]="!mobileOpen()" [class.lg:translate-x-0]="true">
        <div class="flex items-center justify-between px-2"><app-brand /><button class="grid size-9 place-items-center rounded-lg text-slate-500 lg:hidden" (click)="mobileOpen.set(false)" aria-label="Fechar menu"><svg lucideX size="20"></svg></button></div>
        <nav class="mt-9 space-y-1 text-sm font-bold text-slate-600" aria-label="Área administrativa">
          @for (item of nav; track item.label) {
            <a [routerLink]="item.link" [queryParams]="item.tab ? { tab: item.tab } : null" routerLinkActive="!bg-brand-50 !text-brand-800" [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }" class="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50 hover:text-ink" (click)="mobileOpen.set(false)">
              @switch (item.icon) {
                @case ("dashboard") { <svg lucideLayoutDashboard size="18" aria-hidden="true"></svg> }
                @case ("store") { <svg lucideStore size="18" aria-hidden="true"></svg> }
                @case ("package") { <svg lucidePackage size="18" aria-hidden="true"></svg> }
                @case ("palette") { <svg lucidePalette size="18" aria-hidden="true"></svg> }
                @case ("qrcode") { <svg lucideQrCode size="18" aria-hidden="true"></svg> }
                @case ("settings") { <svg lucideSettings size="18" aria-hidden="true"></svg> }
                @case ("account") { <svg lucideUserRound size="18" aria-hidden="true"></svg> }
                @case ("plan") { <svg lucideCreditCard size="18" aria-hidden="true"></svg> }
              }
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="mt-auto rounded-2xl bg-ink p-4 text-white"><p class="text-xs font-bold text-brand-300">Plano Free</p><p class="mt-1 text-sm text-white/65">Até 100 produtos</p><div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full w-[12%] rounded-full bg-brand-400"></div></div></div>
        <button class="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50" (click)="logout()"><svg lucideLogOut size="18"></svg> Sair</button>
      </aside>
      @if (mobileOpen()) { <button class="fixed inset-0 z-40 bg-black/35 lg:hidden" aria-label="Fechar menu" (click)="mobileOpen.set(false)"></button> }
      <section class="min-w-0">
        <header class="sticky top-0 z-30 flex h-17 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8">
          <button class="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden" (click)="mobileOpen.set(true)" aria-label="Abrir menu"><svg lucideMenu size="20"></svg></button>
          <p class="hidden text-sm font-semibold text-slate-500 sm:block">Gerencie seu negócio em um só lugar</p>
          <div class="flex items-center gap-3"><div class="hidden text-right sm:block"><p class="max-w-48 truncate text-sm font-extrabold">{{ auth.user()?.email }}</p><p class="text-xs text-slate-400">Administrador</p></div><span class="grid size-10 place-items-center rounded-full bg-brand-100 font-extrabold text-brand-800">{{ initial }}</span></div>
        </header>
        <main class="p-4 sm:p-6 lg:p-8"><router-outlet /></main>
      </section>
    </div>
  `,
})
export class DashboardShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly mobileOpen = signal(false);
  readonly initial = this.auth.user()?.email?.[0]?.toUpperCase() ?? "Q";
  readonly nav = [
    { label: "Visão geral", link: "/app", exact: true, icon: "dashboard" },
    { label: "Cardápios", link: "/app/editor", tab: "menu", icon: "store" },
    { label: "Produtos", link: "/app/editor", tab: "products", icon: "package" },
    { label: "Aparência", link: "/app/editor", tab: "appearance", icon: "palette" },
    { label: "QR Code", link: "/app/editor", tab: "qrcode", icon: "qrcode" },
    { label: "Loja", link: "/app/editor", tab: "store", icon: "settings" },
    { label: "Conta", link: "/app/editor", tab: "account", icon: "account" },
    { label: "Plano", link: "/app/editor", tab: "plan", icon: "plan" },
  ];

  logout(): void { this.auth.logout().subscribe({ next: () => this.router.navigateByUrl("/") }); }
}
