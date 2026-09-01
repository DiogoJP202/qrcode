import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiClient } from "../../core/api-client.service";
import { PublicMenu } from "../../core/models";
import { BrandComponent } from "../../shared/brand.component";
import { MenuViewComponent } from "./menu-view.component";

@Component({
  selector: "app-public-menu-page",
  imports: [BrandComponent, MenuViewComponent],
  template: `
    @if (loading()) {
      <main class="mx-auto min-h-screen max-w-3xl bg-white px-5 py-8"><div class="skeleton mx-auto size-20 rounded-full"></div><div class="skeleton mx-auto mt-4 h-8 w-56"></div><div class="mt-10 grid gap-4">@for (i of [1,2,3]; track i) { <div class="skeleton h-32"></div> }</div></main>
    } @else if (notFound()) {
      <main class="grid min-h-screen place-items-center bg-slate-50 px-5 text-center"><div><span class="text-6xl">🍽️</span><h1 class="mt-6 text-3xl font-black">Cardápio não encontrado</h1><p class="mt-3 text-slate-500">Confira o endereço ou peça um novo link ao estabelecimento.</p><div class="mt-8"><app-brand /></div></div></main>
    } @else if (menu()) {
      <app-menu-view [menu]="menu()!" />
    }
  `,
})
export class PublicMenuPage {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  readonly menu = signal<PublicMenu | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  constructor() {
    const slug = this.route.snapshot.paramMap.get("slug") ?? "";
    this.api.http.get<PublicMenu>(this.api.url(`/public/menus/${slug}`)).subscribe({ next: (menu) => { this.menu.set(menu); this.loading.set(false); document.title = `${menu.storeName} — ${menu.menuName}`; }, error: () => { this.notFound.set(true); this.loading.set(false); } });
  }
}
