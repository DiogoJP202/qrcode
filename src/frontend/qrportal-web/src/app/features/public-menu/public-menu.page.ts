import { CurrencyPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LucideSearch, LucideStar } from "@lucide/angular";
import { ApiClient } from "../../core/api-client.service";
import { PublicMenu, PublicProduct } from "../../core/models";
import { BrandComponent } from "../../shared/brand.component";

@Component({
  selector: "app-public-menu-page",
  imports: [CurrencyPipe, LucideSearch, LucideStar, BrandComponent],
  template: `
    @if (loading()) {
      <main class="mx-auto min-h-screen max-w-3xl bg-white px-5 py-8"><div class="skeleton mx-auto size-20 rounded-full"></div><div class="skeleton mx-auto mt-4 h-8 w-56"></div><div class="mt-10 grid gap-4">@for (i of [1,2,3]; track i) { <div class="skeleton h-32"></div> }</div></main>
    } @else if (notFound()) {
      <main class="grid min-h-screen place-items-center bg-slate-50 px-5 text-center"><div><span class="text-6xl">🍽️</span><h1 class="mt-6 text-3xl font-black">Cardápio não encontrado</h1><p class="mt-3 text-slate-500">Confira o endereço ou peça um novo link ao estabelecimento.</p><div class="mt-8"><app-brand /></div></div></main>
    } @else if (menu()) {
      <main class="min-h-screen" [style.background]="menu()!.theme.backgroundColor" [style.--menu-primary]="menu()!.theme.primaryColor" [style.--menu-text]="menu()!.theme.secondaryColor">
        <header class="relative overflow-hidden px-5 pt-12 pb-8 text-center"><div class="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-10" [style.background]="'radial-gradient(circle at 50% 0,' + menu()!.theme.primaryColor + ',transparent 70%)'"></div>@if (menu()!.logoUrl) { <img [src]="menu()!.logoUrl" [alt]="'Logo ' + menu()!.storeName" class="relative mx-auto size-22 rounded-3xl object-contain shadow-lg" /> } @else { <div class="relative mx-auto grid size-22 place-items-center rounded-3xl text-3xl font-black text-white shadow-lg" [style.background]="menu()!.theme.primaryColor">{{ menu()!.storeName.charAt(0) }}</div> }<h1 class="relative mt-5 text-3xl font-black tracking-tight" [style.color]="menu()!.theme.secondaryColor">{{ menu()!.storeName }}</h1><p class="relative mt-1 font-semibold opacity-55" [style.color]="menu()!.theme.secondaryColor">{{ menu()!.menuName }}</p>@if (menu()!.description) { <p class="relative mx-auto mt-3 max-w-lg text-sm leading-6 opacity-60" [style.color]="menu()!.theme.secondaryColor">{{ menu()!.description }}</p> }</header>

        <div class="sticky top-0 z-20 border-y border-black/5 bg-white/90 px-4 py-3 backdrop-blur-xl"><nav class="mx-auto flex max-w-3xl gap-2 overflow-x-auto pb-1" aria-label="Categorias">@for (category of filteredCategories(); track category.name) { <a [href]="'#category-' + $index" class="shrink-0 rounded-full px-4 py-2 text-sm font-extrabold text-white" [style.background]="menu()!.theme.primaryColor">{{ category.name }}</a> }</nav></div>

        <section class="mx-auto max-w-3xl px-4 py-7 sm:px-6">
          <label class="relative block"><span class="sr-only">Buscar no cardápio</span><svg lucideSearch class="absolute left-4 top-3.5 text-slate-400" size="19"></svg><input class="field !rounded-2xl !pl-12" type="search" placeholder="Buscar um item..." [value]="query()" (input)="query.set($any($event.target).value)" /></label>
          @for (category of filteredCategories(); track category.name; let categoryIndex = $index) {
            <section class="scroll-mt-22 pt-10" [id]="'category-' + categoryIndex"><h2 class="text-2xl font-black tracking-tight" [style.color]="menu()!.theme.secondaryColor">{{ category.name }}</h2>@if (category.description) { <p class="mt-1 text-sm opacity-55" [style.color]="menu()!.theme.secondaryColor">{{ category.description }}</p> }
              <div class="mt-5 grid gap-4 sm:grid-cols-2">@for (product of category.products; track product.name) { <article class="overflow-hidden border border-black/[.06] bg-white shadow-[0_10px_30px_rgba(0,0,0,.05)]" [class]="cardClass"><div class="aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">@if (product.imageUrl || product.thumbnailUrl) { <img [src]="product.imageUrl || product.thumbnailUrl" [alt]="product.name" loading="lazy" class="size-full object-cover" /> } @else { <div class="grid size-full place-items-center text-4xl">🍴</div> }</div><div class="p-4">@if (product.isFeatured) { <span class="mb-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" [style.color]="menu()!.theme.primaryColor"><svg lucideStar size="12" fill="currentColor"></svg>Destaque</span> }<h3 class="font-black" [style.color]="menu()!.theme.secondaryColor">{{ product.name }}</h3>@if (product.description) { <p class="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">{{ product.description }}</p> }<div class="mt-4 flex items-baseline gap-2">@if (product.promotionalPrice !== null) { <span class="text-lg font-black" [style.color]="menu()!.theme.primaryColor">{{ product.promotionalPrice | currency:'BRL' }}</span><span class="text-xs text-slate-400 line-through">{{ product.price | currency:'BRL' }}</span> } @else { <span class="text-lg font-black" [style.color]="menu()!.theme.primaryColor">{{ product.price | currency:'BRL' }}</span> }</div></div></article> } @empty { <p class="text-sm text-slate-500">Nenhum produto disponível.</p> }</div>
            </section>
          } @empty { <div class="py-20 text-center"><p class="text-4xl">🔎</p><h2 class="mt-5 text-xl font-black">Nada encontrado</h2><p class="mt-2 text-slate-500">Tente buscar por outro nome.</p></div> }
        </section>
        <footer class="mt-8 border-t border-black/5 py-8 text-center"><p class="text-xs font-semibold opacity-40" [style.color]="menu()!.theme.secondaryColor">Cardápio atualizado automaticamente</p><a href="/" class="mt-3 inline-block scale-90"><app-brand /></a></footer>
      </main>
    }
  `,
})
export class PublicMenuPage {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  readonly menu = signal<PublicMenu | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly query = signal("");
  get cardClass(): string { return this.menu()?.theme.style === "square" ? "rounded-none" : this.menu()?.theme.style === "pill" ? "rounded-[2rem]" : "rounded-2xl"; }

  constructor() {
    const slug = this.route.snapshot.paramMap.get("slug") ?? "";
    this.api.http.get<PublicMenu>(this.api.url(`/public/menus/${slug}`)).subscribe({ next: (menu) => { this.menu.set(menu); this.loading.set(false); document.title = `${menu.storeName} — ${menu.menuName}`; }, error: () => { this.notFound.set(true); this.loading.set(false); } });
  }

  filteredCategories(): PublicMenu["categories"] {
    const query = this.query().trim().toLocaleLowerCase("pt-BR");
    if (!query) return this.menu()?.categories ?? [];
    return (this.menu()?.categories ?? []).map((category) => ({ ...category, products: category.products.filter((product: PublicProduct) => `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(query)) })).filter((category) => category.products.length > 0);
  }
}
