import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowRight, LucideInfo } from "@lucide/angular";
import { PublicProduct } from "../../core/models";
import { MenuViewComponent } from "../public-menu/menu-view.component";
import { ExampleProduct, exampleMenu } from "./example-menu";

@Component({
  selector: "app-example-page",
  imports: [RouterLink, MenuViewComponent, LucideArrowRight, LucideInfo],
  template: `
    <div class="border-b border-amber-200 bg-amber-50 px-5 py-3">
      <div class="mx-auto flex max-w-3xl items-start gap-2.5 text-sm leading-6 text-amber-900">
        <svg lucideInfo class="mt-0.5 shrink-0" size="18" aria-hidden="true"></svg>
        <p><strong class="font-black">Exemplo de cardápio publicado.</strong> A Cantina Bela Vista é fictícia — é esta a página que seus clientes abrem ao ler o QR Code. Toque num item para ver a página dele.</p>
      </div>
    </div>

    <app-menu-view [menu]="menu" [productLink]="productLink" />

    <div class="sticky bottom-0 z-30 border-t border-black/5 bg-white/95 px-5 py-4 backdrop-blur-xl">
      <div class="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p class="text-center text-sm font-bold text-slate-600 sm:text-left">Seu cardápio pode ficar assim em poucos minutos.</p>
        <a routerLink="/cadastro" class="btn-primary btn-brand w-full sm:w-auto">Criar o meu cardápio <svg lucideArrowRight size="18" aria-hidden="true"></svg></a>
      </div>
    </div>
  `,
})
export class ExamplePage {
  readonly menu = exampleMenu;
  readonly productLink = (product: PublicProduct) => ["/exemplo", (product as ExampleProduct).slug];
}
