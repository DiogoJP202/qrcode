import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { LucideCheck, LucideMailCheck, LucideSave, LucideShieldCheck, LucideUserRound } from "@lucide/angular";
import { finalize } from "rxjs";
import { apiErrorMessage } from "../../core/api-client.service";
import { AuthService } from "../../core/auth.service";

@Component({
  selector: "app-account-page",
  imports: [ReactiveFormsModule, RouterLink, LucideCheck, LucideMailCheck, LucideSave, LucideShieldCheck, LucideUserRound],
  template: `
    <div class="mx-auto max-w-4xl"><header><span class="eyebrow">Dados pessoais</span><h1 class="mt-2 text-3xl font-black tracking-tight">Minha conta</h1><p class="mt-2 text-slate-500">Mantenha seus dados de identificação e contato atualizados.</p></header>
      @if (notice()) { <div class="mt-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800"><svg lucideCheck size="17"></svg>{{ notice() }}</div> }@if (error()) { <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{{ error() }}</div> }
      <div class="mt-7 grid gap-6 lg:grid-cols-[1fr_300px]"><form class="surface rounded-3xl p-6 sm:p-8" [formGroup]="form" (ngSubmit)="save()"><div class="flex items-center gap-3"><span class="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700"><svg lucideUserRound size="22"></svg></span><h2 class="text-xl font-black">Perfil do responsável</h2></div><label class="field-label mt-7">Nome completo</label><input class="field" autocomplete="name" formControlName="fullName" /><label class="field-label mt-5">Telefone com DDD</label><input class="field" type="tel" autocomplete="tel" formControlName="phoneNumber" /><label class="field-label mt-5">E-mail</label><input class="field bg-slate-50" [value]="auth.user()?.email" disabled /><p class="mt-2 text-xs text-slate-400">A alteração de e-mail terá um fluxo de verificação dedicado em uma próxima versão.</p><button class="btn-primary btn-brand mt-7" [disabled]="saving()"><svg lucideSave size="18"></svg>{{ saving() ? "Salvando..." : "Salvar perfil" }}</button></form>
        <aside class="space-y-4"><div class="surface rounded-3xl p-6"><span class="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><svg lucideMailCheck size="20"></svg></span><h2 class="mt-4 font-black">E-mail</h2><p class="mt-2 text-sm leading-6 text-slate-500">{{ auth.user()?.emailConfirmed ? "Confirmado e pronto para publicar." : "Pendente de confirmação." }}</p><span class="status-pill mt-4" [class]="auth.user()?.emailConfirmed ? 'bg-brand-100 text-brand-800' : 'bg-amber-100 text-amber-800'">{{ auth.user()?.emailConfirmed ? "Confirmado" : "Pendente" }}</span></div><div class="surface rounded-3xl p-6"><span class="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><svg lucideShieldCheck size="20"></svg></span><h2 class="mt-4 font-black">Termos atuais</h2><p class="mt-2 text-sm leading-6 text-slate-500">{{ auth.user()?.hasAcceptedCurrentTerms ? "Aceite registrado para a versão vigente." : "Sua conta é anterior à versão vigente." }}</p><div class="mt-4 flex gap-3 text-sm font-extrabold text-brand-700"><a routerLink="/termos">Termos</a><a routerLink="/privacidade">Privacidade</a></div></div></aside>
      </div>
    </div>
  `,
})
export class AccountPage {
  readonly auth = inject(AuthService); readonly saving = signal(false); readonly notice = signal<string | null>(null); readonly error = signal<string | null>(null);
  readonly form = new FormGroup({ fullName: new FormControl(this.auth.user()?.fullName ?? "", { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\s*\S+\s+\S+/)] }), phoneNumber: new FormControl(this.auth.user()?.phoneNumber ?? "", { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10,15}\D*$).+$/)] }) });
  save(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.saving.set(true); this.error.set(null); this.auth.updateProfile(this.form.controls.fullName.value, this.form.controls.phoneNumber.value).pipe(finalize(() => this.saving.set(false))).subscribe({ next: () => this.notice.set("Perfil atualizado."), error: (error) => this.error.set(apiErrorMessage(error)) }); }
}
