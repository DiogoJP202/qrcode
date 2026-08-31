import { Component, computed, inject, signal } from "@angular/core";
import { LucideCheck, LucideCopy, LucideDownload, LucideExternalLink, LucideInfo, LucidePrinter, LucideQrCode, LucideShare2 } from "@lucide/angular";
import { catchError, finalize, of, switchMap } from "rxjs";
import { apiErrorMessage, ApiClient } from "../../core/api-client.service";
import { MenuDetails, MenuSummary, PagedResult, Product, Store } from "../../core/models";

type QrTarget = "menu" | "business" | "product";

@Component({
  selector: "app-qr-center-page",
  imports: [LucideCheck, LucideCopy, LucideDownload, LucideExternalLink, LucideInfo, LucidePrinter, LucideQrCode, LucideShare2],
  template: `
    <div class="mx-auto max-w-6xl"><header><span class="eyebrow">Compartilhamento</span><h1 class="mt-2 text-3xl font-black tracking-tight">Central de QR Codes</h1><p class="mt-2 max-w-2xl text-slate-500">Escolha o destino, confira o código real e baixe no formato ideal para impressão ou redes sociais.</p></header>
      @if (error()) { <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{{ error() }}</div> }
      @if (notice()) { <div class="mt-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800"><svg lucideCheck size="17"></svg>{{ notice() }}</div> }
      @if (loading()) { <div class="skeleton mt-7 h-[560px]"></div> } @else if (menu() && store()) {
        <div class="mt-7 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside class="surface h-fit rounded-3xl p-6 lg:sticky lg:top-24"><span class="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700"><svg lucideQrCode size="23"></svg></span><h2 class="mt-5 text-xl font-black">Destino do QR Code</h2><div class="mt-6 grid gap-2"><button type="button" class="rounded-xl border p-4 text-left" [class]="target() === 'menu' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'" (click)="target.set('menu')"><strong class="block text-sm">Cardápio completo</strong><span class="mt-1 block text-xs text-slate-500">/m/{{ menu()!.slug }}</span></button><button type="button" class="rounded-xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-45" [class]="target() === 'business' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'" [disabled]="!store()!.isPresentationPublished" (click)="target.set('business')"><strong class="block text-sm">Página do negócio</strong><span class="mt-1 block text-xs text-slate-500">{{ store()!.isPresentationPublished ? '/empresa/' + store()!.slug : 'Publique a apresentação primeiro' }}</span></button><button type="button" class="rounded-xl border p-4 text-left" [class]="target() === 'product' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'" (click)="target.set('product')"><strong class="block text-sm">Produto específico</strong><span class="mt-1 block text-xs text-slate-500">Direcione para um item do cardápio</span></button></div>
            @if (target() === 'product') { <label class="field-label mt-5">Produto</label><select class="field" [value]="productId()" (change)="selectProduct($event)">@for (product of products(); track product.id) { <option [value]="product.id">{{ product.name }}</option> }</select> }
            @if (menu()!.status !== 'Published' && target() !== 'business') { <div class="mt-5 flex gap-2 rounded-xl bg-amber-50 p-4 text-sm leading-5 text-amber-800"><svg lucideInfo class="shrink-0" size="18"></svg>Publique o cardápio para ativar estes QR Codes.</div> }
          </aside>
          <section class="surface overflow-hidden rounded-3xl"><div class="grid gap-8 p-6 sm:p-9 md:grid-cols-[280px_1fr] md:items-center"><div class="mx-auto w-full max-w-72 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,.09)]">@if (isAvailable()) { <img [src]="qrImageUrl()" [alt]="'QR Code para ' + destinationLabel()" class="aspect-square w-full" /> } @else { <div class="grid aspect-square place-items-center rounded-2xl bg-slate-50 text-slate-300"><svg lucideQrCode size="120" strokeWidth="1"></svg></div> }<div class="mt-4 border-t border-slate-100 pt-4 text-center"><p class="text-xs font-black uppercase tracking-widest text-slate-400">QRPortal</p><p class="mt-1 truncate text-sm font-extrabold">{{ destinationLabel() }}</p></div></div><div><span class="eyebrow">Código pronto</span><h2 class="mt-3 text-3xl font-black tracking-tight">{{ destinationLabel() }}</h2><p class="mt-4 leading-7 text-slate-500">O QR aponta para uma URL permanente. Você pode atualizar o conteúdo sem reimprimir o código.</p><div class="mt-6 flex items-center gap-2 rounded-2xl bg-slate-50 p-3"><code class="min-w-0 flex-1 truncate text-xs sm:text-sm">{{ publicUrl() }}</code><button type="button" class="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-600 shadow-sm" (click)="copy()" aria-label="Copiar link"><svg lucideCopy size="17"></svg></button></div><div class="mt-5 grid gap-3 sm:grid-cols-2">@if (isAvailable()) { <a [href]="downloadUrl('png')" class="btn-primary btn-brand"><svg lucideDownload size="17"></svg>Baixar PNG</a><a [href]="downloadUrl('svg')" class="btn-secondary"><svg lucideDownload size="17"></svg>Baixar SVG</a> }<button type="button" class="btn-secondary" (click)="share()"><svg lucideShare2 size="17"></svg>Compartilhar</button><a [href]="publicUrl()" target="_blank" class="btn-secondary">Abrir página <svg lucideExternalLink size="16"></svg></a></div></div></div>
            <div class="grid gap-4 border-t border-slate-100 bg-slate-50/70 p-6 sm:grid-cols-3 sm:p-8">@for (tip of tips; track tip.title) { <div><span class="grid size-9 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">@if ($index === 0) { <svg lucidePrinter size="17"></svg> } @else { {{ $index + 1 }} }</span><h3 class="mt-3 text-sm font-black">{{ tip.title }}</h3><p class="mt-1 text-xs leading-5 text-slate-500">{{ tip.text }}</p></div> }</div>
          </section>
        </div>
      }
    </div>
  `,
})
export class QrCenterPage {
  private readonly api = inject(ApiClient);
  readonly loading = signal(true); readonly error = signal<string | null>(null); readonly notice = signal<string | null>(null);
  readonly store = signal<Store | null>(null); readonly menu = signal<MenuDetails | null>(null); readonly target = signal<QrTarget>("menu"); readonly productId = signal("");
  readonly products = computed(() => this.menu()?.categories.flatMap((category) => category.products) ?? []);
  readonly selectedProduct = computed(() => this.products().find((product) => product.id === this.productId()) ?? null);
  readonly destinationLabel = computed(() => this.target() === "menu" ? this.menu()?.name ?? "Cardápio" : this.target() === "business" ? this.store()?.publicName ?? "Negócio" : this.selectedProduct()?.name ?? "Produto");
  readonly publicUrl = computed(() => { const store = this.store(); const menu = this.menu(); if (!store || !menu) return ""; const path = this.target() === "menu" ? `/m/${menu.slug}` : this.target() === "business" ? `/empresa/${store.slug}` : `/p/${this.productId()}`; return `${location.origin}${path}`; });
  readonly isAvailable = computed(() => this.target() === "business" ? !!this.store()?.isPresentationPublished : this.menu()?.status === "Published" && (this.target() !== "product" || !!this.selectedProduct()));
  readonly qrImageUrl = computed(() => this.qrApiUrl("svg", false));
  readonly tips = [{ title: "Para impressão", text: "Prefira SVG em materiais grandes e PNG para impressoras comuns." }, { title: "Mantenha contraste", text: "Use fundo claro e preserve uma margem livre ao redor do código." }, { title: "Teste antes", text: "Leia o QR com dois celulares antes de produzir placas ou embalagens." }];

  constructor() {
    this.api.http.get<PagedResult<Store>>(this.api.url("/stores")).pipe(switchMap((stores) => { const store = stores.items[0]; if (!store) return of<PagedResult<MenuSummary>>({ items: [], page: 1, pageSize: 20, total: 0 }); this.store.set(store); return this.api.http.get<PagedResult<MenuSummary>>(this.api.url(`/stores/${store.id}/menus`)); }), switchMap((menus) => menus.items[0] ? this.api.http.get<MenuDetails>(this.api.url(`/menus/${menus.items[0].id}`)) : of(null)), catchError((error) => { this.error.set(apiErrorMessage(error)); return of(null); }), finalize(() => this.loading.set(false))).subscribe((menu) => { if (!menu) return; this.menu.set(menu); this.productId.set(menu.categories.flatMap((category) => category.products)[0]?.id ?? ""); });
  }

  selectProduct(event: Event): void { this.productId.set((event.target as HTMLSelectElement).value); }
  downloadUrl(format: "png" | "svg"): string { return this.qrApiUrl(format, true); }
  copy(): void { navigator.clipboard?.writeText(this.publicUrl()).then(() => this.flash("Link copiado.")); }
  share(): void { if (navigator.share) navigator.share({ title: this.destinationLabel(), url: this.publicUrl() }).catch(() => undefined); else this.copy(); }
  private qrApiUrl(format: "png" | "svg", download: boolean): string { const store = this.store(); const menu = this.menu(); if (!store || !menu) return ""; const path = this.target() === "menu" ? `/public/menus/${menu.slug}/qr.${format}` : this.target() === "business" ? `/public/stores/${store.slug}/qr.${format}` : `/public/products/${this.productId()}/qr.${format}`; return this.api.url(`${path}${download ? "?download=true" : ""}`); }
  private flash(message: string): void { this.notice.set(message); setTimeout(() => this.notice.set(null), 2500); }
}
