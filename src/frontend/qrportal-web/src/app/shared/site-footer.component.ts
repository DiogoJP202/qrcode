import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BrandComponent } from "./brand.component";

@Component({
  selector: "app-site-footer",
  imports: [RouterLink, BrandComponent],
  template: `
    <footer class="border-t border-slate-200 bg-white py-12">
      <div class="container-page grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div><app-brand /><p class="mt-4 max-w-md text-sm leading-6 text-slate-500">Cardápios digitais bonitos, rápidos e simples de manter. Feito para quem precisa cuidar do negócio, não da tecnologia.</p></div>
        <nav class="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600" aria-label="Rodapé">
          <a routerLink="/sobre">Sobre</a><a routerLink="/planos">Planos</a><a routerLink="/contato">Contato</a><a routerLink="/termos">Termos</a><a routerLink="/privacidade">Privacidade</a><a routerLink="/login">Entrar</a>
        </nav>
      </div>
      <div class="container-page mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">© 2026 QRPortal. Todos os direitos reservados.</div>
    </footer>
  `,
})
export class SiteFooterComponent {}
