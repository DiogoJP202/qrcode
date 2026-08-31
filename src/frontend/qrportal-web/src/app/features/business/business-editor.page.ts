import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { LucideCheck, LucideExternalLink, LucideEye, LucideGlobe2, LucideSave } from "@lucide/angular";
import { catchError, finalize, of } from "rxjs";
import { apiErrorMessage, ApiClient } from "../../core/api-client.service";
import { PagedResult, Store } from "../../core/models";

@Component({
  selector: "app-business-editor-page",
  imports: [ReactiveFormsModule, RouterLink, LucideCheck, LucideExternalLink, LucideEye, LucideGlobe2, LucideSave],
  template: `
    <div class="mx-auto max-w-7xl"><header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span class="eyebrow">Presença digital</span><h1 class="mt-2 text-3xl font-black tracking-tight">Página do negócio</h1><p class="mt-2 max-w-2xl text-slate-500">Conte sua história, reúna contatos e leve o visitante ao cardápio.</p></div>@if (store()?.isPresentationPublished) { <a [href]="'/empresa/' + store()!.slug" target="_blank" class="btn-secondary">Abrir página <svg lucideExternalLink size="16"></svg></a> }</header>
      @if (notice()) { <div class="mt-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800"><svg lucideCheck size="17"></svg>{{ notice() }}</div> }
      @if (error()) { <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{{ error() }}</div> }
      @if (loading()) { <div class="skeleton mt-7 h-[620px]"></div> } @else if (store()) {
        <div class="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <form class="space-y-6" [formGroup]="form" (ngSubmit)="save()">
            <section class="surface rounded-3xl p-6 sm:p-8"><div class="flex items-center gap-3"><span class="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700"><svg lucideGlobe2 size="22"></svg></span><div><h2 class="text-xl font-black">Mensagem principal</h2><p class="text-sm text-slate-500">O que torna seu negócio especial?</p></div></div><label class="field-label mt-7">Título de apresentação</label><input class="field" formControlName="headline" maxlength="160" placeholder="Comida feita com afeto, todos os dias." /><label class="field-label mt-5">Sobre o negócio</label><textarea class="field min-h-36 resize-y" formControlName="about" maxlength="2000" placeholder="Conte sua história, especialidades e propósito."></textarea></section>
            <section class="surface rounded-3xl p-6 sm:p-8"><h2 class="text-xl font-black">Contato e atendimento</h2><div class="mt-6 grid gap-4 sm:grid-cols-2"><label class="field-label">Telefone<input class="field" formControlName="contactPhone" placeholder="(11) 3333-3333" /></label><label class="field-label">WhatsApp<input class="field" formControlName="whatsApp" placeholder="(11) 99999-9999" /></label><label class="field-label">E-mail público<input class="field" type="email" formControlName="contactEmail" placeholder="contato@negocio.com" /></label><label class="field-label">Horário<input class="field" formControlName="businessHours" placeholder="Seg–Sáb, 11h às 23h" /></label></div><label class="field-label mt-4">Endereço</label><input class="field" formControlName="address" placeholder="Rua, número, bairro e cidade" /><div class="mt-4 grid gap-4 sm:grid-cols-2"><label class="field-label">Site<input class="field" type="url" formControlName="websiteUrl" placeholder="https://seusite.com" /></label><label class="field-label">Instagram<input class="field" type="url" formControlName="instagramUrl" placeholder="https://instagram.com/seunegocio" /></label></div></section>
            <section class="surface rounded-3xl p-6 sm:p-8"><h2 class="text-xl font-black">Estilo da página</h2><div class="mt-6 grid gap-4 sm:grid-cols-3"><label class="text-sm font-bold text-slate-600">Destaque<input type="color" class="mt-2 h-12 w-full rounded-xl border border-slate-200 p-1" formControlName="primaryColor" /></label><label class="text-sm font-bold text-slate-600">Fundo<input type="color" class="mt-2 h-12 w-full rounded-xl border border-slate-200 p-1" formControlName="backgroundColor" /></label><label class="text-sm font-bold text-slate-600">Texto<input type="color" class="mt-2 h-12 w-full rounded-xl border border-slate-200 p-1" formControlName="textColor" /></label></div><label class="field-label mt-5">Composição</label><select class="field" formControlName="style"><option value="modern">Moderna</option><option value="classic">Clássica</option><option value="bold">Impactante</option></select><label class="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" class="mt-1 size-4 accent-brand-600" formControlName="isPublished" /><span><strong class="block text-sm">Publicar página do negócio</strong><span class="mt-1 block text-sm leading-5 text-slate-500">A página ficará disponível em qrportal.com/empresa/{{ store()!.slug }}.</span></span></label><div class="mt-6 flex flex-wrap gap-3"><button class="btn-primary btn-brand" [disabled]="saving()"><svg lucideSave size="18"></svg>{{ saving() ? "Salvando..." : "Salvar página" }}</button><a routerLink="/app/editor" [queryParams]="{ tab: 'store' }" class="btn-secondary">Editar nome e logo</a></div></section>
          </form>
          <aside class="xl:sticky xl:top-24 xl:h-fit"><p class="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400"><svg lucideEye size="15"></svg> Preview</p><div class="overflow-hidden rounded-[2rem] border border-slate-200 shadow-xl" [style.background]="form.controls.backgroundColor.value" [style.color]="form.controls.textColor.value"><div class="p-7 text-center"><div class="mx-auto grid size-20 place-items-center overflow-hidden rounded-3xl bg-white text-3xl font-black shadow-lg" [style.color]="form.controls.primaryColor.value">@if (store()!.logoUrl) { <img [src]="store()!.logoUrl" alt="" class="size-full object-contain" /> } @else { {{ store()!.publicName.charAt(0) }} }</div><p class="mt-5 text-sm font-bold opacity-55">{{ store()!.publicName }}</p><h2 class="mt-2 text-3xl font-black tracking-tight">{{ form.controls.headline.value || "Seu título aparece aqui" }}</h2><p class="mt-4 line-clamp-5 text-sm leading-6 opacity-65">{{ form.controls.about.value || "Conte a história e o propósito do seu negócio para aproximar novos clientes." }}</p><span class="mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-black text-white" [style.background]="form.controls.primaryColor.value">Ver cardápio</span></div><div class="border-t border-black/5 p-5 text-xs opacity-60">{{ form.controls.businessHours.value || "Horário de atendimento" }}</div></div></aside>
        </div>
      }
    </div>
  `,
})
export class BusinessEditorPage {
  private readonly api = inject(ApiClient);
  readonly store = signal<Store | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly notice = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly form = new FormGroup({
    headline: new FormControl("", { nonNullable: true, validators: [Validators.maxLength(160)] }),
    about: new FormControl("", { nonNullable: true, validators: [Validators.maxLength(2000)] }),
    contactPhone: new FormControl("", { nonNullable: true }), whatsApp: new FormControl("", { nonNullable: true }),
    contactEmail: new FormControl("", { nonNullable: true, validators: [Validators.email] }), address: new FormControl("", { nonNullable: true }),
    businessHours: new FormControl("", { nonNullable: true }), websiteUrl: new FormControl("", { nonNullable: true }), instagramUrl: new FormControl("", { nonNullable: true }),
    primaryColor: new FormControl("#16A34A", { nonNullable: true }), backgroundColor: new FormControl("#F8FAFC", { nonNullable: true }), textColor: new FormControl("#0F172A", { nonNullable: true }),
    style: new FormControl<"modern" | "classic" | "bold">("modern", { nonNullable: true }), isPublished: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    this.api.http.get<PagedResult<Store>>(this.api.url("/stores")).pipe(catchError((error) => { this.error.set(apiErrorMessage(error)); return of({ items: [], page: 1, pageSize: 20, total: 0 }); }), finalize(() => this.loading.set(false))).subscribe((result) => {
      const store = result.items[0]; if (!store) return; this.store.set(store);
      this.form.patchValue({ headline: store.presentationHeadline ?? "", about: store.presentationAbout ?? "", contactPhone: store.contactPhone ?? "", whatsApp: store.whatsApp ?? "", contactEmail: store.contactEmail ?? "", address: store.address ?? "", businessHours: store.businessHours ?? "", websiteUrl: store.websiteUrl ?? "", instagramUrl: store.instagramUrl ?? "", primaryColor: store.presentationPrimaryColor, backgroundColor: store.presentationBackgroundColor, textColor: store.presentationTextColor, style: store.presentationStyle, isPublished: store.isPresentationPublished });
    });
  }

  save(): void {
    const store = this.store(); if (!store || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.error.set(null); this.notice.set(null);
    const raw = this.form.getRawValue();
    const body = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, typeof value === "string" && value.trim() === "" ? null : value]));
    this.api.http.patch<Store>(this.api.url(`/stores/${store.id}/presentation`), body).pipe(finalize(() => this.saving.set(false))).subscribe({ next: (updated) => { this.store.set(updated); this.notice.set(updated.isPresentationPublished ? "Página salva e publicada." : "Rascunho salvo."); }, error: (error) => this.error.set(apiErrorMessage(error)) });
  }
}
