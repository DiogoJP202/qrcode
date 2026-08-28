import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { LucideArrowRight, LucideExternalLink, LucidePackage, LucidePalette, LucideQrCode, LucideStore } from "@lucide/angular";
import { catchError, of, switchMap } from "rxjs";
import { ApiClient } from "../../core/api-client.service";
import { AuthService } from "../../core/auth.service";
import { MenuSummary, PagedResult, Store } from "../../core/models";

@Component({
  selector: "app-overview-page",
  imports: [RouterLink, LucideArrowRight, LucideExternalLink, LucidePackage, LucidePalette, LucideQrCode, LucideStore],
  template: `
    <div class="mx-auto max-w-6xl">
      @if (loading()) {
        <div class="skeleton h-10 w-72"></div><div class="mt-8 grid gap-5 sm:grid-cols-3">@for (i of [1,2,3]; track i) { <div class="skeleton h-36"></div> }</div>
      } @else if (!store()) {
        <section class="surface rounded-3xl p-8 text-center sm:p-14"><span class="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-700"><svg lucideStore size="30"></svg></span><h1 class="mt-6 text-3xl font-black">Vamos criar seu primeiro cardápio</h1><p class="mx-auto mt-3 max-w-lg text-slate-500">O assistente salva cada etapa para você continuar quando quiser.</p><a routerLink="/app/onboarding" class="btn-primary btn-brand mt-7">Começar agora <svg lucideArrowRight size="18"></svg></a></section>
      } @else {
        <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p class="eyebrow">Visão geral</p><h1 class="mt-2 text-3xl font-black tracking-tight">Olá! Seu cardápio está {{ published ? "no ar" : "quase pronto" }}.</h1><p class="mt-2 text-slate-500">{{ store()?.publicName }}</p></div>@if (!published) { <a routerLink="/app/onboarding" class="btn-primary btn-brand">Continuar configuração <svg lucideArrowRight size="18"></svg></a> } @else { <a [href]="publicUrl" target="_blank" class="btn-secondary">Ver cardápio <svg lucideExternalLink size="17"></svg></a> }</div>

        <section class="mt-8 grid gap-4 sm:grid-cols-3">
          <article class="surface rounded-2xl p-5"><span class="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><svg lucideStore size="20"></svg></span><p class="mt-5 text-sm font-semibold text-slate-500">Status</p><p class="mt-1 text-xl font-black">{{ published ? "Publicado" : "Rascunho" }}</p></article>
          <article class="surface rounded-2xl p-5"><span class="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><svg lucidePackage size="20"></svg></span><p class="mt-5 text-sm font-semibold text-slate-500">Produtos</p><p class="mt-1 text-xl font-black">{{ menu()?.productCount ?? 0 }} <span class="text-sm font-semibold text-slate-400">de 100</span></p></article>
          <article class="surface rounded-2xl p-5"><span class="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><svg lucideQrCode size="20"></svg></span><p class="mt-5 text-sm font-semibold text-slate-500">Link público</p><p class="mt-1 truncate text-base font-black">/m/{{ menu()?.slug ?? "—" }}</p></article>
        </section>

        <section class="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <article class="surface rounded-3xl p-6"><div class="flex items-center justify-between"><div><p class="text-sm font-semibold text-slate-500">Seu cardápio</p><h2 class="mt-1 text-xl font-black">{{ menu()?.name ?? "Primeiro cardápio" }}</h2></div><span class="status-pill" [class]="published ? 'bg-brand-100 text-brand-800' : 'bg-amber-100 text-amber-800'">{{ published ? "Publicado" : "Rascunho" }}</span></div><div class="mt-6 grid grid-cols-2 gap-3"><a routerLink="/app/editor" [queryParams]="{tab:'products'}" class="rounded-2xl border border-slate-200 p-4 font-bold hover:border-brand-300">Editar produtos <svg lucideArrowRight class="mt-3 text-brand-600" size="18"></svg></a><a routerLink="/app/editor" [queryParams]="{tab:'appearance'}" class="rounded-2xl border border-slate-200 p-4 font-bold hover:border-brand-300">Mudar aparência <svg lucidePalette class="mt-3 text-brand-600" size="18"></svg></a></div></article>
          <article class="rounded-3xl bg-ink p-6 text-white"><p class="text-sm font-bold text-brand-300">Próxima ação</p><h2 class="mt-3 text-xl font-black">{{ published ? "Mantenha tudo fresco" : "Publique quando estiver pronto" }}</h2><p class="mt-3 text-sm leading-6 text-white/60">{{ published ? "Marque itens indisponíveis e atualize preços em segundos." : "Revise os itens e confirme seu e-mail para colocar o link no ar." }}</p><a routerLink="/app/editor" class="mt-6 flex items-center gap-2 text-sm font-extrabold text-brand-300">Abrir editor <svg lucideArrowRight size="16"></svg></a></article>
        </section>
      }
    </div>
  `,
})
export class OverviewPage {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(true);
  readonly store = signal<Store | null>(null);
  readonly menu = signal<MenuSummary | null>(null);
  get published(): boolean { return this.menu()?.status === "Published"; }
  get publicUrl(): string { return `/m/${this.menu()?.slug ?? ""}`; }

  constructor() {
    this.auth.refresh().pipe(
      switchMap(() => this.api.http.get<PagedResult<Store>>(this.api.url("/stores"))),
      switchMap((stores) => {
        const store = stores.items[0] ?? null; this.store.set(store);
        if (!store) return of<PagedResult<MenuSummary>>({ items: [], page: 1, pageSize: 20, total: 0 });
        return this.api.http.get<PagedResult<MenuSummary>>(this.api.url(`/stores/${store.id}/menus`));
      }),
      catchError(() => of<PagedResult<MenuSummary>>({ items: [], page: 1, pageSize: 20, total: 0 })),
    ).subscribe((menus) => { this.menu.set(menus.items[0] ?? null); this.loading.set(false); });
  }
}
