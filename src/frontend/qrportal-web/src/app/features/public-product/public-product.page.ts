import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ApiClient } from "../../core/api-client.service";
import { PublicProductDetail } from "../../core/models";
import { ProductViewComponent } from "./product-view.component";

@Component({
  selector: "app-public-product-page",
  imports: [RouterLink, ProductViewComponent],
  template: `
    @if (loading()) {
      <main class="mx-auto min-h-screen max-w-5xl px-5 py-8"><div class="skeleton h-8 w-36"></div><div class="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><div class="skeleton aspect-square rounded-3xl"></div><div class="space-y-4"><div class="skeleton h-8 w-3/4"></div><div class="skeleton h-24"></div><div class="skeleton h-72 rounded-3xl"></div></div></div></main>
    } @else if (notFound()) {
      <main class="grid min-h-screen place-items-center bg-slate-50 px-5 text-center"><div><span class="text-6xl">🍽️</span><h1 class="mt-6 text-3xl font-black">Produto não encontrado</h1><p class="mt-3 text-slate-500">O item pode estar indisponível ou o endereço não existe mais.</p><a routerLink="/" class="btn-primary mt-8">Voltar ao início</a></div></main>
    } @else if (details()) {
      <app-product-view [details]="details()!" [backLink]="['/m', details()!.menuSlug]" [qrBaseUrl]="qrBaseUrl" />
    }
  `,
})
export class PublicProductPage {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  readonly details = signal<PublicProductDetail | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly qrBaseUrl: string;

  constructor() {
    const productId = this.route.snapshot.paramMap.get("productId") ?? "";
    this.qrBaseUrl = this.api.url(`/public/products/${productId}/qr`);
    this.api.http.get<PublicProductDetail>(this.api.url(`/public/products/${productId}`)).subscribe({
      next: (details) => {
        this.details.set(details);
        this.loading.set(false);
        document.title = `${details.product.name} — ${details.storeName}`;
      },
      error: () => { this.notFound.set(true); this.loading.set(false); },
    });
  }
}
