import { Component, computed, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { LucideArrowRight, LucideInfo } from "@lucide/angular";
import { ApiClient } from "../../core/api-client.service";
import { PublicProductDetail } from "../../core/models";
import { ProductViewComponent } from "../public-product/product-view.component";
import { exampleMenu, findExampleProduct } from "./example-menu";

@Component({
  selector: "app-example-product-page",
  imports: [RouterLink, ProductViewComponent, LucideArrowRight, LucideInfo],
  template: `
    @if (details(); as detail) {
      <div class="border-b border-amber-200 bg-amber-50 px-5 py-3">
        <div class="mx-auto flex max-w-5xl items-start gap-2.5 text-sm leading-6 text-amber-900">
          <svg lucideInfo class="mt-0.5 shrink-0" size="18" aria-hidden="true"></svg>
          <p><strong class="font-black">Exemplo de produto publicado.</strong> Cada item do cardápio ganha uma página como esta, com QR Code próprio que abre exatamente este endereço.</p>
        </div>
      </div>

      <app-product-view [details]="detail" [backLink]="['/exemplo']" [qrBaseUrl]="qrBaseUrl()" />

      <div class="sticky bottom-0 z-30 border-t border-black/5 bg-white/95 px-5 py-4 backdrop-blur-xl">
        <div class="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p class="text-center text-sm font-bold text-slate-600 sm:text-left">Cada produto do seu cardápio ganha uma página e um QR Code como este.</p>
          <a routerLink="/cadastro" class="btn-primary btn-brand w-full sm:w-auto">Criar o meu cardápio <svg lucideArrowRight size="18" aria-hidden="true"></svg></a>
        </div>
      </div>
    } @else {
      <main class="grid min-h-screen place-items-center bg-slate-50 px-5 text-center"><div><span class="text-6xl">🍽️</span><h1 class="mt-6 text-3xl font-black">Item do exemplo não encontrado</h1><a routerLink="/exemplo" class="btn-primary mt-8">Voltar ao cardápio de exemplo</a></div></main>
    }
  `,
})
export class ExampleProductPage {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  private readonly slug = this.route.snapshot.paramMap.get("slug") ?? "";
  private readonly product = findExampleProduct(this.slug);

  readonly qrBaseUrl = computed(() => this.api.url(`/public/example/${this.slug}/qr`));
  readonly details = computed<PublicProductDetail | null>(() => this.product
    ? {
        storeName: exampleMenu.storeName,
        menuName: exampleMenu.menuName,
        menuSlug: exampleMenu.slug,
        logoUrl: exampleMenu.logoUrl,
        theme: exampleMenu.theme,
        categoryName: this.product.categoryName,
        product: this.product,
        updatedAt: exampleMenu.updatedAt,
      }
    : null);

  constructor() {
    // `document` não existe durante o pré-render; o serviço Title funciona nos dois lados.
    if (this.product) inject(Title).setTitle(`${this.product.name} — ${exampleMenu.storeName}`);
  }
}
