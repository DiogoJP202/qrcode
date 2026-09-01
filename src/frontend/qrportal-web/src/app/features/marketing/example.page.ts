import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowRight, LucideInfo } from "@lucide/angular";
import { PublicMenu } from "../../core/models";
import { MenuViewComponent } from "../public-menu/menu-view.component";

// Ilustração sem dependência de rede: um degradê com o emoji do prato, embutido
// como data URI. O CSP de produção já permite `img-src data:`.
function art(emoji: string, from: string, to: string, width: number, height: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/><text x="${width / 2}" y="${height / 2}" font-size="${Math.round(Math.min(width, height) * 0.42)}" text-anchor="middle" dominant-baseline="central">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const dish = (emoji: string, from: string, to: string) => art(emoji, from, to, 640, 360);
const logo = (emoji: string, from: string, to: string) => art(emoji, from, to, 400, 400);

const exampleMenu: PublicMenu = {
  storeName: "Cantina Bela Vista",
  menuName: "Cardápio da casa",
  description: "Massas frescas, forno a lenha e receitas de família desde 1998.",
  slug: "exemplo",
  logoUrl: logo("🍅", "#F4E3D3", "#E8C7A8"),
  // Fixo para o build pré-renderizado ser determinístico.
  updatedAt: "2026-01-01T12:00:00.000Z",
  theme: {
    preset: "custom",
    primaryColor: "#B4532A",
    secondaryColor: "#2A211C",
    backgroundColor: "#FBF7F1",
    style: "rounded",
    fontFamily: "serif",
    cardLayout: "grid",
    imageStyle: "cover",
  },
  categories: [
    {
      name: "Entradas",
      description: "Para começar bem, feitas na hora.",
      products: [
        { id: "exemplo-1", name: "Bruschetta da casa", description: "Pão rústico, tomate confitado, manjericão e azeite extravirgem.", price: 26.0, promotionalPrice: null, isFeatured: false, imageUrl: dish("🍞", "#F6E0C8", "#E2B384"), thumbnailUrl: null },
        { id: "exemplo-2", name: "Bolinho de bacalhau", description: "Seis unidades, servidas com limão siciliano e aioli.", price: 38.0, promotionalPrice: 32.0, isFeatured: false, imageUrl: dish("🥟", "#F3DEC4", "#DDAF7C"), thumbnailUrl: null },
      ],
    },
    {
      name: "Pratos principais",
      description: "Massas feitas diariamente na cozinha.",
      products: [
        { id: "exemplo-3", name: "Nhoque ao sugo", description: "Nhoque de batata com molho de tomates assados lentamente e parmesão.", price: 54.0, promotionalPrice: null, isFeatured: true, imageUrl: dish("🍝", "#F2D6C0", "#D89A6A"), thumbnailUrl: null },
        { id: "exemplo-4", name: "Risoto de cogumelos", description: "Arroz arbóreo, mix de cogumelos frescos e finalização com trufa.", price: 62.0, promotionalPrice: null, isFeatured: false, imageUrl: dish("🍚", "#EFE2CE", "#CBB48C"), thumbnailUrl: null },
        { id: "exemplo-5", name: "Filé ao molho de vinho", description: "Medalhão grelhado, redução de vinho tinto e batatas rústicas.", price: 78.0, promotionalPrice: 69.0, isFeatured: true, imageUrl: dish("🥩", "#EED2C4", "#C57F63"), thumbnailUrl: null },
      ],
    },
    {
      name: "Sobremesas",
      description: null,
      products: [
        { id: "exemplo-6", name: "Tiramisù", description: "Camadas de mascarpone, café coado na hora e cacau.", price: 29.0, promotionalPrice: null, isFeatured: false, imageUrl: dish("🍰", "#F0E4D6", "#C9A98D"), thumbnailUrl: null },
        { id: "exemplo-7", name: "Petit gâteau", description: "Bolo quente de chocolate meio amargo com sorvete de creme.", price: 32.0, promotionalPrice: null, isFeatured: false, imageUrl: dish("🍫", "#E8D5C6", "#B08163"), thumbnailUrl: null },
      ],
    },
    {
      name: "Bebidas",
      description: null,
      products: [
        { id: "exemplo-8", name: "Limonada siciliana", description: "Feita na hora, com hortelã.", price: 14.0, promotionalPrice: null, isFeatured: false, imageUrl: dish("🍋", "#F5EFD4", "#D9CE86"), thumbnailUrl: null },
        { id: "exemplo-9", name: "Vinho da casa", description: "Taça de tinto seco selecionado pelo sommelier.", price: 34.0, promotionalPrice: null, isFeatured: false, imageUrl: dish("🍷", "#EAD5D6", "#B57B84"), thumbnailUrl: null },
      ],
    },
  ],
};

@Component({
  selector: "app-example-page",
  imports: [RouterLink, MenuViewComponent, LucideArrowRight, LucideInfo],
  template: `
    <div class="border-b border-amber-200 bg-amber-50 px-5 py-3">
      <div class="mx-auto flex max-w-3xl items-start gap-2.5 text-sm leading-6 text-amber-900">
        <svg lucideInfo class="mt-0.5 shrink-0" size="18" aria-hidden="true"></svg>
        <p><strong class="font-black">Exemplo de cardápio publicado.</strong> A Cantina Bela Vista é fictícia — é esta a página que seus clientes abrem ao ler o QR Code.</p>
      </div>
    </div>

    <app-menu-view [menu]="menu" [linkProducts]="false" />

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
}
