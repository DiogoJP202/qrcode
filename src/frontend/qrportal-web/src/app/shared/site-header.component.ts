import { Component, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { LucideMenu, LucideX } from "@lucide/angular";
import { BrandComponent } from "./brand.component";

@Component({
  selector: "app-site-header",
  imports: [RouterLink, RouterLinkActive, LucideMenu, LucideX, BrandComponent],
  template: `
    <header class="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-[#fbfcfb]/90 backdrop-blur-xl">
      <div class="container-page flex h-18 items-center justify-between">
        <app-brand />
        <nav class="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex" aria-label="Navegação principal">
          <a routerLink="/como-funciona" routerLinkActive="text-brand-700">Como funciona</a>
          <a routerLink="/clientes" routerLinkActive="text-brand-700">Clientes</a>
          <a routerLink="/planos" routerLinkActive="text-brand-700">Planos</a>
          <a routerLink="/sobre" routerLinkActive="text-brand-700">Sobre</a>
        </nav>
        <div class="hidden items-center gap-2 sm:flex">
          <a routerLink="/login" class="px-4 py-2 text-sm font-bold text-slate-700">Entrar</a>
          <a routerLink="/cadastro" class="btn-primary btn-brand !min-h-10 !rounded-xl !px-4 !py-2 text-sm">Criar cardápio</a>
        </div>
        <button class="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white sm:hidden" type="button" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-label="Abrir menu">
          @if (open()) { <svg lucideX size="20" aria-hidden="true"></svg> } @else { <svg lucideMenu size="20" aria-hidden="true"></svg> }
        </button>
      </div>
      @if (open()) {
        <nav class="border-t border-slate-100 bg-white px-5 py-5 sm:hidden" aria-label="Navegação móvel">
          <div class="mx-auto grid max-w-lg gap-1 text-sm font-bold text-slate-700">
            <a routerLink="/como-funciona" class="rounded-xl px-3 py-3" (click)="open.set(false)">Como funciona</a>
            <a routerLink="/clientes" class="rounded-xl px-3 py-3" (click)="open.set(false)">Clientes</a>
            <a routerLink="/planos" class="rounded-xl px-3 py-3" (click)="open.set(false)">Planos</a>
            <a routerLink="/sobre" class="rounded-xl px-3 py-3" (click)="open.set(false)">Sobre</a>
            <a routerLink="/login" class="rounded-xl px-3 py-3" (click)="open.set(false)">Entrar</a>
            <a routerLink="/cadastro" class="btn-primary btn-brand mt-2" (click)="open.set(false)">Criar meu cardápio</a>
          </div>
        </nav>
      }
    </header>
  `,
})
export class SiteHeaderComponent { readonly open = signal(false); }
