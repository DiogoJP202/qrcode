import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LucideArrowRight, LucideAtSign, LucideClock3, LucideGlobe2, LucideMail, LucideMapPin, LucideMessageCircle, LucidePhone } from "@lucide/angular";
import { ApiClient } from "../../core/api-client.service";
import { PublicStore } from "../../core/models";
import { BrandComponent } from "../../shared/brand.component";

@Component({
  selector: "app-public-business-page",
  imports: [RouterLink, LucideArrowRight, LucideAtSign, LucideClock3, LucideGlobe2, LucideMail, LucideMapPin, LucideMessageCircle, LucidePhone, BrandComponent],
  template: `
    @if (loading()) { <main class="min-h-screen bg-slate-50 p-6"><div class="skeleton mx-auto h-[700px] max-w-5xl rounded-3xl"></div></main> }
    @else if (!business()) { <main class="grid min-h-screen place-items-center bg-slate-50 px-5 text-center"><div><p class="text-8xl font-black text-brand-100">404</p><h1 class="mt-4 text-3xl font-black">Negócio não encontrado</h1><p class="mt-3 text-slate-500">Esta página ainda não foi publicada.</p><a routerLink="/" class="btn-primary btn-brand mt-7">Voltar ao início</a></div></main> }
    @else {
      <main class="min-h-screen" [style.background]="business()!.backgroundColor" [style.color]="business()!.textColor">
        <section class="relative overflow-hidden px-5 py-16 sm:py-24"><div class="pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-15" [style.background]="'radial-gradient(circle at 50% 0,' + business()!.primaryColor + ',transparent 70%)'"></div><div class="relative mx-auto max-w-5xl" [class]="heroClass">
          <div><div class="grid size-24 place-items-center overflow-hidden rounded-3xl bg-white text-4xl font-black shadow-xl" [style.color]="business()!.primaryColor">@if (business()!.logoUrl) { <img [src]="business()!.logoUrl" [alt]="'Logo ' + business()!.publicName" class="size-full object-contain" /> } @else { {{ business()!.publicName.charAt(0) }} }</div><p class="mt-6 text-sm font-black uppercase tracking-[.18em] opacity-50">{{ business()!.publicName }}</p><h1 class="mt-4 max-w-3xl text-[clamp(2.8rem,7vw,5.8rem)] leading-[.96] font-black tracking-[-.06em]">{{ business()!.headline }}</h1><p class="mt-7 max-w-2xl whitespace-pre-line text-lg leading-8 opacity-65">{{ business()!.about }}</p><div class="mt-8 flex flex-wrap gap-3">@if (business()!.publishedMenuSlug) { <a [routerLink]="['/m', business()!.publishedMenuSlug]" class="inline-flex min-h-12 items-center gap-2 rounded-xl px-6 font-black text-white" [style.background]="business()!.primaryColor">Ver cardápio <svg lucideArrowRight size="18"></svg></a> }@if (business()!.whatsApp) { <a [href]="whatsAppUrl" target="_blank" rel="noopener" class="btn-secondary"><svg lucideMessageCircle size="18"></svg> WhatsApp</a> }</div></div>
        </div></section>
        <section class="mx-auto max-w-5xl px-5 pb-20"><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @if (business()!.contactPhone) { <a [href]="'tel:' + business()!.contactPhone" class="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-5 font-extrabold backdrop-blur"><svg class="mt-0.5 shrink-0" lucidePhone size="20"></svg><span class="grid gap-1"><small class="text-[10px] uppercase tracking-widest opacity-45">Telefone</small>{{ business()!.contactPhone }}</span></a> }
          @if (business()!.contactEmail) { <a [href]="'mailto:' + business()!.contactEmail" class="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-5 font-extrabold backdrop-blur"><svg class="mt-0.5 shrink-0" lucideMail size="20"></svg><span class="grid gap-1"><small class="text-[10px] uppercase tracking-widest opacity-45">E-mail</small>{{ business()!.contactEmail }}</span></a> }
          @if (business()!.address) { <div class="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-5 font-extrabold backdrop-blur"><svg class="mt-0.5 shrink-0" lucideMapPin size="20"></svg><span class="grid gap-1"><small class="text-[10px] uppercase tracking-widest opacity-45">Endereço</small>{{ business()!.address }}</span></div> }
          @if (business()!.businessHours) { <div class="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-5 font-extrabold backdrop-blur"><svg class="mt-0.5 shrink-0" lucideClock3 size="20"></svg><span class="grid gap-1"><small class="text-[10px] uppercase tracking-widest opacity-45">Atendimento</small>{{ business()!.businessHours }}</span></div> }
          @if (business()!.websiteUrl) { <a [href]="business()!.websiteUrl!" target="_blank" rel="noopener" class="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-5 font-extrabold backdrop-blur"><svg class="mt-0.5 shrink-0" lucideGlobe2 size="20"></svg><span class="grid gap-1"><small class="text-[10px] uppercase tracking-widest opacity-45">Site</small>Abrir site</span></a> }
          @if (business()!.instagramUrl) { <a [href]="business()!.instagramUrl!" target="_blank" rel="noopener" class="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-5 font-extrabold backdrop-blur"><svg class="mt-0.5 shrink-0" lucideAtSign size="20"></svg><span class="grid gap-1"><small class="text-[10px] uppercase tracking-widest opacity-45">Instagram</small>Ver perfil</span></a> }
        </div><div class="mt-16 text-center opacity-45"><app-brand /></div></section>
      </main>
    }
  `,
})
export class PublicBusinessPage {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  readonly business = signal<PublicStore | null>(null);
  readonly loading = signal(true);

  constructor() {
    const slug = this.route.snapshot.paramMap.get("slug") ?? "";
    this.api.http.get<PublicStore>(this.api.url(`/public/stores/${slug}`)).subscribe({ next: (business) => { this.business.set(business); this.loading.set(false); document.title = `${business.publicName} — apresentação`; }, error: () => this.loading.set(false) });
  }

  get heroClass(): string { return this.business()?.style === "classic" ? "text-center [&>div>div]:mx-auto [&>div>h1]:mx-auto [&>div>p]:mx-auto [&>div>div:last-child]:justify-center" : this.business()?.style === "bold" ? "border-l-8 pl-7 sm:pl-12" : ""; }
  get whatsAppUrl(): string { return `https://wa.me/${this.business()?.whatsApp?.replace(/\D/g, "") ?? ""}`; }
}
