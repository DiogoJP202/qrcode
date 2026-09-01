import { CurrencyPipe } from "@angular/common";
import { Component, computed, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideCheck, LucideDownload, LucideLink, LucideQrCode, LucideShare2, LucideStar } from "@lucide/angular";
import { PublicProductDetail } from "../../core/models";
import { BrandComponent } from "../../shared/brand.component";

// Detalhe do produto publicado, compartilhado entre a página real e o exemplo
// institucional. O QR Code vem sempre da API, por `qrBaseUrl`.
@Component({
  selector: "app-product-view",
  imports: [CurrencyPipe, RouterLink, LucideArrowLeft, LucideCheck, LucideDownload, LucideLink, LucideQrCode, LucideShare2, LucideStar, BrandComponent],
  template: `
    <main class="min-h-screen px-4 py-6 sm:px-6 sm:py-10" [style.background]="details().theme.backgroundColor" [style.color]="details().theme.secondaryColor" [style.font-family]="fontStack()">
      <div class="mx-auto max-w-5xl">
        <header class="flex items-center justify-between gap-4">
          <a [routerLink]="backLink()" class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-800 shadow-sm transition hover:-translate-x-0.5"><svg lucideArrowLeft size="17"></svg> Cardápio</a>
          <div class="flex min-w-0 items-center gap-3">@if (details().logoUrl) { <img [src]="details().logoUrl" [alt]="'Logo ' + details().storeName" class="size-10 rounded-xl object-contain" /> }<div class="min-w-0 text-right"><p class="truncate text-sm font-black">{{ details().storeName }}</p><p class="truncate text-xs opacity-55">{{ details().menuName }}</p></div></div>
        </header>

        <section class="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div>
            <div class="aspect-square overflow-hidden bg-white shadow-[0_20px_60px_rgba(15,23,42,.1)]" [class]="cardClass()">@if (details().product.imageUrl || details().product.thumbnailUrl) { <img [src]="details().product.imageUrl || details().product.thumbnailUrl" [alt]="details().product.name" class="size-full" [class.object-cover]="details().theme.imageStyle === 'cover'" [class.object-contain]="details().theme.imageStyle === 'contain'" /> } @else { <div class="grid size-full place-items-center text-7xl">🍴</div> }</div>
            <div class="px-1 pt-7">@if (details().product.isFeatured) { <span class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest" [style.color]="details().theme.primaryColor"><svg lucideStar size="13" fill="currentColor"></svg> Destaque</span> }<p class="mt-4 text-xs font-black uppercase tracking-[.2em] opacity-45">{{ details().categoryName }}</p><h1 class="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{{ details().product.name }}</h1>@if (details().product.description) { <p class="mt-4 max-w-2xl text-base leading-7 opacity-65">{{ details().product.description }}</p> }<div class="mt-6 flex items-baseline gap-3">@if (details().product.promotionalPrice !== null) { <span class="text-3xl font-black" [style.color]="details().theme.primaryColor">{{ details().product.promotionalPrice | currency:'BRL' }}</span><span class="text-sm opacity-40 line-through">{{ details().product.price | currency:'BRL' }}</span> } @else { <span class="text-3xl font-black" [style.color]="details().theme.primaryColor">{{ details().product.price | currency:'BRL' }}</span> }</div></div>
          </div>

          <aside class="self-start rounded-3xl bg-white p-6 text-center text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,.08)] lg:sticky lg:top-8">
            <span class="mx-auto grid size-11 place-items-center rounded-2xl text-white" [style.background]="details().theme.primaryColor"><svg lucideShare2 class="lg:hidden" size="22"></svg><svg lucideQrCode class="hidden lg:block" size="23"></svg></span>
            <h2 class="mt-4 text-xl font-black"><span class="lg:hidden">Compartilhe este item</span><span class="hidden lg:inline">QR Code deste produto</span></h2>
            <p class="mt-2 text-sm leading-5 text-slate-500"><span class="lg:hidden">Envie o link direto para quem quiser ver este prato.</span><span class="hidden lg:inline">Compartilhe este item diretamente, sem abrir o cardápio completo.</span></p>

            <!-- No celular o QR é redundante: quem está aqui provavelmente acabou de escanear um. -->
            <div class="mx-auto max-w-64 rounded-2xl border border-slate-100 bg-white p-3" [class]="showQr() ? 'mt-5 block' : 'mt-5 hidden lg:block'"><img [src]="qrBaseUrl() + '.svg'" [alt]="'QR Code de ' + details().product.name" class="aspect-square w-full" /></div>
            <div class="grid-cols-2 gap-3" [class]="showQr() ? 'mt-5 grid' : 'mt-5 hidden lg:grid'"><a [href]="qrBaseUrl() + '.png?download=true'" class="btn-secondary !px-3 text-xs"><svg lucideDownload size="15"></svg> PNG</a><a [href]="qrBaseUrl() + '.svg?download=true'" class="btn-secondary !px-3 text-xs"><svg lucideDownload size="15"></svg> SVG</a></div>

            <!-- A visibilidade vai no wrapper: .btn-primary é definida fora de camada e
                 venceria os utilitários de display do Tailwind aplicados no próprio botão. -->
            <div class="lg:hidden"><button type="button" class="btn-primary mt-5 w-full" (click)="share()"><svg lucideShare2 size="17"></svg> Compartilhar</button></div>
            <button type="button" class="btn-secondary mt-3 w-full lg:mt-5" (click)="copyLink()">@if (copied()) { <svg lucideCheck size="17"></svg> Link copiado } @else { <svg lucideLink size="17"></svg> Copiar link }</button>
            <div class="lg:hidden"><button type="button" class="mt-4 text-sm font-extrabold text-slate-500" (click)="showQr.set(!showQr())">{{ showQr() ? "Ocultar QR Code" : "Mostrar QR Code" }}</button></div>
          </aside>
        </section>

        <footer class="py-12 text-center"><a routerLink="/" class="inline-block scale-90"><app-brand /></a></footer>
      </div>
    </main>
  `,
})
export class ProductViewComponent {
  readonly details = input.required<PublicProductDetail>();
  readonly backLink = input.required<unknown[]>();
  readonly qrBaseUrl = input.required<string>();
  readonly copied = signal(false);
  readonly showQr = signal(false);

  readonly cardClass = computed(() => this.details().theme.style === "square" ? "rounded-none" : this.details().theme.style === "pill" ? "rounded-[3rem]" : "rounded-3xl");
  readonly fontStack = computed(() => this.details().theme.fontFamily === "serif" ? "Georgia, Cambria, serif" : this.details().theme.fontFamily === "rounded" ? "Nunito, ui-rounded, system-ui" : "Inter, ui-sans-serif, system-ui");

  // Web Share API onde existir; onde não existir, copiar o link resolve o mesmo problema.
  async share(): Promise<void> {
    const payload = { title: this.details().product.name, text: this.details().storeName, url: location.href };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // Cancelar o menu nativo não é erro e não deve virar cópia silenciosa.
        return;
      }
    }
    await this.copyLink();
  }

  async copyLink(): Promise<void> {
    await navigator.clipboard.writeText(location.href);
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 2500);
  }
}
