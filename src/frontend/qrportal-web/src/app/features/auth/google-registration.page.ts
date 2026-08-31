import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideCheck, LucideMapPin } from "@lucide/angular";
import { finalize, switchMap } from "rxjs";
import { apiErrorMessage, ApiClient } from "../../core/api-client.service";
import { AuthService } from "../../core/auth.service";
import { ExternalLoginPending } from "../../core/models";
import { BrandComponent } from "../../shared/brand.component";

@Component({
  selector: "app-google-registration-page",
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideCheck, LucideMapPin, BrandComponent],
  template: `
    <main class="min-h-screen bg-[#f7f9f8] px-5 py-6 sm:py-10">
      <div class="mx-auto max-w-2xl"><div class="flex items-center justify-between"><app-brand /><a routerLink="/login" class="flex items-center gap-2 text-sm font-bold text-slate-500"><svg lucideArrowLeft size="16"></svg> Voltar</a></div>
        <section class="surface mt-10 rounded-3xl p-6 sm:p-10">
          <span class="grid size-12 place-items-center rounded-2xl bg-white shadow-sm"><span class="grid size-6 place-items-center rounded-full bg-[conic-gradient(#4285F4_0_25%,#34A853_0_50%,#FBBC05_0_75%,#EA4335_0)] text-[10px] font-black text-white">G</span></span>
          <span class="eyebrow mt-6">Última etapa</span><h1 class="mt-3 text-3xl font-black tracking-tight">Complete seu cadastro</h1><p class="mt-3 leading-7 text-slate-500">O Google confirmou seu e-mail. Precisamos dos dados de contato e do seu aceite para criar a conta.</p>
          @if (pending()) { <div class="mt-6 rounded-2xl bg-slate-50 p-4"><p class="text-xs font-bold uppercase tracking-wider text-slate-400">E-mail confirmado pelo Google</p><p class="mt-1 font-extrabold">{{ pending()!.email }}</p></div> }
          <form class="mt-7" [formGroup]="form" (ngSubmit)="submit()">
            <label class="field-label">Nome completo</label><input class="field" autocomplete="name" formControlName="fullName" />
            <label class="field-label mt-5">Telefone com DDD</label><input class="field" type="tel" autocomplete="tel" formControlName="phoneNumber" placeholder="(11) 99999-9999" />
            <label class="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-5 text-slate-600"><input type="checkbox" formControlName="acceptTerms" class="mt-0.5 size-4 shrink-0 accent-brand-600" /><span>Li e aceito os <a routerLink="/termos" target="_blank" class="font-extrabold text-brand-700">Termos de Uso</a> e a <a routerLink="/privacidade" target="_blank" class="font-extrabold text-brand-700">Política de Privacidade</a>.</span></label>
            <label class="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-5 text-slate-600"><input type="checkbox" formControlName="includeLocation" class="mt-0.5 size-4 shrink-0 accent-brand-600" /><span><strong class="flex items-center gap-1 text-slate-700"><svg lucideMapPin size="15"></svg> Localização aproximada (opcional)</strong>O cadastro continua normalmente se você não permitir.</span></label>
            @if (error()) { <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{{ error() }}</div> }
            <button class="btn-primary btn-brand mt-7 w-full" [disabled]="loading()"><svg lucideCheck size="18"></svg>{{ loading() ? "Criando conta..." : "Concluir cadastro" }}</button>
          </form>
        </section>
      </div>
    </main>
  `,
})
export class GoogleRegistrationPage {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly pending = signal<ExternalLoginPending | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = new FormGroup({
    fullName: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\s*\S+\s+\S+/)] }),
    phoneNumber: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10,15}\D*$).+$/)] }),
    acceptTerms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
    includeLocation: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    this.api.http.get<ExternalLoginPending>(this.api.url("/auth/google/pending")).subscribe({
      next: (pending) => { this.pending.set(pending); this.form.controls.fullName.setValue(pending.suggestedName ?? ""); },
      error: () => this.router.navigate(["/login"], { queryParams: { error: "google" } }),
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(null);
    const { fullName, phoneNumber, acceptTerms, includeLocation } = this.form.getRawValue();
    const location = includeLocation ? await this.approximateLocation() : {};
    this.auth.completeGoogleRegistration({ fullName, phoneNumber, acceptTerms, termsVersion: "2026-08-31", ...location })
      .pipe(switchMap(() => this.auth.refresh()), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.router.navigateByUrl(response.onboarding.step === "complete" ? "/app" : "/app/onboarding"),
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  private approximateLocation(): Promise<{ latitude?: number; longitude?: number; locationAccuracyMeters?: number }> {
    if (!("geolocation" in navigator)) return Promise.resolve({});
    return new Promise((resolve) => navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, locationAccuracyMeters: position.coords.accuracy }),
      () => resolve({}),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
    ));
  }
}
