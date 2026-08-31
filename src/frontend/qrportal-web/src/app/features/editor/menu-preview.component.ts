import { CurrencyPipe } from "@angular/common";
import { Component, input } from "@angular/core";
import { MenuDetails, Theme } from "../../core/models";

@Component({
  selector: "app-menu-preview",
  imports: [CurrencyPipe],
  template: `
    <aside class="hidden lg:block"><div class="sticky top-24"><p class="mb-3 text-center text-xs font-extrabold uppercase tracking-widest text-slate-400">Preview imediato</p><div class="mx-auto w-[330px] rounded-[2.8rem] border-[9px] border-ink bg-ink p-1 shadow-2xl"><div class="min-h-[600px] overflow-hidden rounded-[2.1rem] px-4 pb-8" [style.background]="theme().backgroundColor" [style.font-family]="fontStack"><div class="mx-auto mt-2 h-5 w-23 rounded-full bg-ink"></div><div class="py-7 text-center">@if (logoUrl()) { <img [src]="logoUrl()" [alt]="'Logo ' + storeName()" class="mx-auto size-14 rounded-full object-contain" /> } @else { <div class="mx-auto grid size-14 place-items-center rounded-full text-xl font-black text-white" [style.background]="theme().primaryColor">{{ storeName().charAt(0) || 'Q' }}</div> }<h3 class="mt-3 text-xl font-black" [style.color]="theme().secondaryColor">{{ menu().name }}</h3><p class="mt-1 text-xs text-slate-500">{{ menu().description || 'Escolha seus favoritos' }}</p></div>@for (category of menu().categories.slice(0, 2); track category.id) { <h4 class="mt-5 text-xs font-black uppercase tracking-wider" [style.color]="theme().secondaryColor">{{ category.name }}</h4>@for (product of category.products.slice(0, 2); track product.id) { <article class="mt-3 flex gap-3 rounded-2xl bg-white p-3 shadow-sm"><div class="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">@if (product.thumbnailUrl) { <img [src]="product.thumbnailUrl" [alt]="product.name" class="size-full" [class.object-cover]="theme().imageStyle === 'cover'" [class.object-contain]="theme().imageStyle === 'contain'" /> }</div><div><p class="text-sm font-black" [style.color]="theme().secondaryColor">{{ product.name }}</p><p class="mt-2 text-xs font-black" [style.color]="theme().primaryColor">{{ product.price | currency:'BRL' }}</p></div></article> } }</div></div></div></aside>
  `,
})
export class MenuPreviewComponent {
  readonly menu = input.required<MenuDetails>();
  readonly theme = input.required<Theme>();
  readonly logoUrl = input<string | null>(null);
  readonly storeName = input("");
  get fontStack(): string { return this.theme().fontFamily === "serif" ? "Georgia, Cambria, serif" : this.theme().fontFamily === "rounded" ? "Nunito, ui-rounded, system-ui" : "Inter, ui-sans-serif, system-ui"; }
}
