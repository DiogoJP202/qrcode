import { CurrencyPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideCheck, LucideDownload, LucideLink, LucideQrCode, LucideStar } from "@lucide/angular";
import { ApiClient } from "../../core/api-client.service";
import { PublicProductDetail } from "../../core/models";
import { BrandComponent } from "../../shared/brand.component";

@Component({
  selector: "app-public-product-page",
  imports: [CurrencyPipe, RouterLink, LucideArrowLeft, LucideCheck, LucideDownload, LucideLink, LucideQrCode, LucideStar, BrandComponent],
  template: `
    @if (loading()) {
      <main class="mx-auto min-h-screen max-w-5xl px-5 py-8"><div class="skeleton h-8 w-36"></div><div class="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><div class="skeleton aspect-square rounded-3xl"></div><div class="space-y-4"><div class="skeleton h-8 w-3/4"></div><div class="skeleton h-24"></div><div class="skeleton h-72 rounded-3xl"></div></div></div></main>
    } @else if (notFound()) {
      <main class="grid min-h-screen place-items-center bg-slate-50 px-5 text-center"><div><span class="text-6xl">🍽️</span><h1 class="mt-6 text-3xl font-black">Produto não encontrado</h1><p class="mt-3 text-slate-500">O item pode estar indisponível ou o endereço não existe mais.</p><a routerLink="/" class="btn-primary mt-8">Voltar ao início</a></div></main>
    } @else if (details()) {
      <main class="min-h-screen px-4 py-6 sm:px-6 sm:py-10" [style.background]="details()!.theme.backgroundColor" [style.color]="details()!.theme.secondaryColor">
        <div class="mx-auto max-w-5xl">
          <header class="flex items-center justify-between gap-4">
            <a [routerLink]="['/m', details()!.menuSlug]" class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-800 shadow-sm transition hover:-translate-x-0.5"><svg lucideArrowLeft size="17"></svg> Cardápio</a>
            <div class="flex min-w-0 items-center gap-3">@if (details()!.logoUrl) { <img [src]="details()!.logoUrl" [alt]="'Logo ' + details()!.storeName" class="size-10 rounded-xl object-contain" /> }<div class="min-w-0 text-right"><p class="truncate text-sm font-black">{{ details()!.storeName }}</p><p class="truncate text-xs opacity-55">{{ details()!.menuName }}</p></div></div>
          </header>

          <section class="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
            <div>
              <div class="aspect-square overflow-hidden bg-white shadow-[0_20px_60px_rgba(15,23,42,.1)]" [class]="cardClass">@if (details()!.product.imageUrl || details()!.product.thumbnailUrl) { <img [src]="details()!.product.imageUrl || details()!.product.thumbnailUrl" [alt]="details()!.product.name" class="size-full object-cover" /> } @else { <div class="grid size-full place-items-center text-7xl">🍴</div> }</div>
              <div class="px-1 pt-7">@if (details()!.product.isFeatured) { <span class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest" [style.color]="details()!.theme.primaryColor"><svg lucideStar size="13" fill="currentColor"></svg> Destaque</span> }<p class="mt-4 text-xs font-black uppercase tracking-[.2em] opacity-45">{{ details()!.categoryName }}</p><h1 class="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{{ details()!.product.name }}</h1>@if (details()!.product.description) { <p class="mt-4 max-w-2xl text-base leading-7 opacity-65">{{ details()!.product.description }}</p> }<div class="mt-6 flex items-baseline gap-3">@if (details()!.product.promotionalPrice !== null) { <span class="text-3xl font-black" [style.color]="details()!.theme.primaryColor">{{ details()!.product.promotionalPrice | currency:'BRL' }}</span><span class="text-sm opacity-40 line-through">{{ details()!.product.price | currency:'BRL' }}</span> } @else { <span class="text-3xl font-black" [style.color]="details()!.theme.primaryColor">{{ details()!.product.price | currency:'BRL' }}</span> }</div></div>
            </div>

            <aside class="self-start rounded-3xl bg-white p-6 text-center text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,.08)] lg:sticky lg:top-8">
              <span class="mx-auto grid size-11 place-items-center rounded-2xl text-white" [style.background]="details()!.theme.primaryColor"><svg lucideQrCode size="23"></svg></span>
              <h2 class="mt-4 text-xl font-black">QR Code deste produto</h2><p class="mt-2 text-sm leading-5 text-slate-500">Compartilhe este item diretamente, sem abrir o cardápio completo.</p>
              <div class="mx-auto mt-5 max-w-64 rounded-2xl border border-slate-100 bg-white p-3"><img [src]="qrSvgUrl()" [alt]="'QR Code de ' + details()!.product.name" class="aspect-square w-full" /></div>
              <div class="mt-5 grid grid-cols-2 gap-3"><a [href]="qrDownloadUrl('png')" class="btn-secondary !px-3 text-xs"><svg lucideDownload size="15"></svg> PNG</a><a [href]="qrDownloadUrl('svg')" class="btn-secondary !px-3 text-xs"><svg lucideDownload size="15"></svg> SVG</a></div>
              <button type="button" class="btn-primary mt-3 w-full" (click)="copyLink()">@if (copied()) { <svg lucideCheck size="17"></svg> Link copiado } @else { <svg lucideLink size="17"></svg> Copiar link }</button>
            </aside>
          </section>

          <footer class="py-12 text-center"><a routerLink="/" class="inline-block scale-90"><app-brand /></a></footer>
        </div>
      </main>
    }
  `,
})
export class PublicProductPage {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  readonly details = signal<PublicProductDetail | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly copied = signal(false);
  readonly qrSvgUrl = signal("");
  private productId = "";

  constructor() {
    this.productId = this.route.snapshot.paramMap.get("productId") ?? "";
    this.qrSvgUrl.set(this.api.url(`/public/products/${this.productId}/qr.svg`));
    this.api.http.get<PublicProductDetail>(this.api.url(`/public/products/${this.productId}`)).subscribe({
      next: (details) => {
        this.details.set(details);
        this.loading.set(false);
        document.title = `${details.product.name} — ${details.storeName}`;
      },
      error: () => { this.notFound.set(true); this.loading.set(false); },
    });
  }

  get cardClass(): string {
    return this.details()?.theme.style === "square" ? "rounded-none" : this.details()?.theme.style === "pill" ? "rounded-[3rem]" : "rounded-3xl";
  }

  qrDownloadUrl(format: "png" | "svg"): string {
    return this.api.url(`/public/products/${this.productId}/qr.${format}?download=true`);
  }

  async copyLink(): Promise<void> {
    await navigator.clipboard.writeText(location.href);
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 2500);
  }
}
