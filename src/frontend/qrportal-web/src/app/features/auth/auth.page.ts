import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideCheck, LucideEye, LucideEyeOff, LucideMapPin } from "@lucide/angular";
import { finalize, switchMap } from "rxjs";
import { apiErrorMessage, ApiClient } from "../../core/api-client.service";
import { AuthService } from "../../core/auth.service";
import { BrandComponent } from "../../shared/brand.component";

@Component({
  selector: "app-auth-page",
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideCheck, LucideEye, LucideEyeOff, LucideMapPin, BrandComponent],
  template: `
    <main class="grid min-h-screen bg-white lg:grid-cols-[.92fr_1.08fr]">
      <section class="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14">
        <div class="flex items-center justify-between"><app-brand /><a routerLink="/" class="flex items-center gap-2 text-sm font-bold text-slate-500"><svg lucideArrowLeft size="16"></svg> Voltar</a></div>
        <div class="mx-auto my-auto w-full max-w-[430px] py-12">
          <span class="eyebrow">{{ isLogin ? "Bem-vindo de volta" : "Comece gratuitamente" }}</span>
          <h1 class="mt-4 text-4xl font-black tracking-[-.045em]">{{ isLogin ? "Entre na sua conta" : "Crie seu cardápio" }}</h1>
          <p class="mt-3 text-slate-500">{{ isLogin ? "Continue de onde parou e mantenha tudo atualizado." : "Leva poucos minutos e você não precisa de cartão." }}</p>

          @if (googleAvailable()) {
            <a [href]="googleUrl" class="btn-secondary mt-8 w-full" aria-label="Continuar com Google"><span class="grid size-5 place-items-center rounded-full bg-[conic-gradient(#4285F4_0_25%,#34A853_0_50%,#FBBC05_0_75%,#EA4335_0)] text-[9px] font-black text-white">G</span> Continuar com Google</a>
          } @else {
            <button type="button" class="btn-secondary mt-8 w-full opacity-55" disabled><span class="grid size-5 place-items-center rounded-full bg-slate-300 text-[9px] font-black text-white">G</span> Google não configurado</button>
          }
          <div class="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400"><span class="h-px flex-1 bg-slate-200"></span>ou use seu e-mail<span class="h-px flex-1 bg-slate-200"></span></div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (!isLogin) {
              <div><label class="field-label" for="fullName">Nome completo</label><input id="fullName" class="field" autocomplete="name" formControlName="fullName" placeholder="Seu nome e sobrenome" />@if (form.controls.fullName.touched && form.controls.fullName.invalid) { <p class="field-error">Informe seu nome completo.</p> }</div>
              <div class="mt-5"><label class="field-label" for="phoneNumber">Telefone com DDD</label><input id="phoneNumber" class="field" type="tel" autocomplete="tel" formControlName="phoneNumber" placeholder="(11) 99999-9999" />@if (form.controls.phoneNumber.touched && form.controls.phoneNumber.invalid) { <p class="field-error">Informe um telefone válido com DDD.</p> }</div>
            }
            <div [class.mt-5]="!isLogin"><label class="field-label" for="email">E-mail</label><input id="email" class="field" type="email" autocomplete="email" formControlName="email" placeholder="voce@negocio.com" />@if (form.controls.email.touched && form.controls.email.invalid) { <p class="field-error">Informe um e-mail válido.</p> }</div>
            <div class="mt-5"><label class="field-label" for="password">Senha</label><div class="relative"><input id="password" class="field !pr-12" [type]="showPassword() ? 'text' : 'password'" [autocomplete]="isLogin ? 'current-password' : 'new-password'" formControlName="password" placeholder="Mínimo de 10 caracteres" /><button type="button" class="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-slate-400" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'">@if (showPassword()) { <svg lucideEyeOff size="19"></svg> } @else { <svg lucideEye size="19"></svg> }</button></div>@if (form.controls.password.touched && form.controls.password.invalid) { <p class="field-error">Use pelo menos 10 caracteres, com maiúscula, minúscula e número.</p> }</div>
            @if (isLogin) { <div class="mt-5 flex items-center justify-between gap-3"><label class="flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" formControlName="rememberMe" class="size-4 accent-brand-600" /> Manter conectado</label><a routerLink="/esqueci-senha" class="text-sm font-extrabold text-brand-700">Esqueci a senha</a></div> }
            @if (!isLogin) {
              <label class="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-5 text-slate-600"><input type="checkbox" formControlName="acceptTerms" class="mt-0.5 size-4 shrink-0 accent-brand-600" /><span>Li e aceito os <a routerLink="/termos" target="_blank" class="font-extrabold text-brand-700">Termos de Uso</a> e a <a routerLink="/privacidade" target="_blank" class="font-extrabold text-brand-700">Política de Privacidade</a>.</span></label>
              @if (form.controls.acceptTerms.touched && form.controls.acceptTerms.invalid) { <p class="field-error">O aceite é necessário para criar a conta.</p> }
              <label class="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-5 text-slate-600"><input type="checkbox" formControlName="includeLocation" class="mt-0.5 size-4 shrink-0 accent-brand-600" /><span><strong class="flex items-center gap-1 text-slate-700"><svg lucideMapPin size="15"></svg> Localização aproximada (opcional)</strong>Se permitido pelo navegador, associa apenas cidade/região aproximada à evidência deste aceite.</span></label>
            }
            @if (error()) { <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{{ error() }}</div> }
            <button class="btn-primary btn-brand mt-7 w-full" type="submit" [disabled]="loading()">{{ loading() ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta grátis" }}</button>
          </form>
          <p class="mt-7 text-center text-sm text-slate-500">{{ isLogin ? "Ainda não tem conta?" : "Já tem uma conta?" }} <a [routerLink]="isLogin ? '/cadastro' : '/login'" class="font-extrabold text-brand-700">{{ isLogin ? "Cadastre-se" : "Entrar" }}</a></p>
        </div>
      </section>

      <aside class="relative hidden overflow-hidden bg-ink p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="absolute -right-30 -top-30 size-[32rem] rounded-full bg-brand-500/20 blur-3xl"></div>
        <p class="relative text-sm font-bold text-brand-300">QRPortal para negócios</p>
        <div class="relative max-w-xl">
          <blockquote class="text-4xl leading-tight font-black tracking-[-.045em]">“Agora eu mudo o prato do dia antes mesmo de abrir as portas.”</blockquote>
          <p class="mt-5 text-white/55">Uma experiência de edição pensada para a rotina, não para especialistas.</p>
          <div class="mt-10 grid gap-4 text-sm font-semibold text-white/75 sm:grid-cols-2">
            @for (item of advantages; track item) { <span class="flex items-center gap-3"><span class="grid size-6 place-items-center rounded-full bg-brand-500 text-ink"><svg lucideCheck size="14" strokeWidth="3"></svg></span>{{ item }}</span> }
          </div>
        </div>
        <p class="relative text-xs text-white/35">Seguro por padrão · Dados isolados por loja</p>
      </aside>
    </main>
  `,
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiClient);
  readonly isLogin = this.route.snapshot.data["mode"] === "login";
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly googleAvailable = signal(false);
  readonly googleUrl = this.api.url("/auth/google/start");
  readonly advantages = ["Primeiro cardápio grátis", "Atualizações instantâneas", "Feito para o celular", "Sem fidelidade"];
  readonly form = new FormGroup({
    fullName: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^\s*\S+\s+\S+/)] }),
    phoneNumber: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10,15}\D*$).+$/)] }),
    email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)] }),
    rememberMe: new FormControl(false, { nonNullable: true }),
    acceptTerms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
    includeLocation: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    if (this.isLogin) {
      this.form.controls.fullName.clearValidators();
      this.form.controls.phoneNumber.clearValidators();
      this.form.controls.acceptTerms.clearValidators();
    }
    this.api.http.get<{ google: boolean }>(this.api.url("/auth/providers")).subscribe({ next: (providers) => this.googleAvailable.set(providers.google) });
    if (this.route.snapshot.queryParamMap?.get("error") === "google") this.error.set("Não foi possível entrar com o Google. Tente novamente.");
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(null);
    const { fullName, phoneNumber, email, password, rememberMe, acceptTerms, includeLocation } = this.form.getRawValue();
    const location = this.isLogin || !includeLocation ? {} : await this.approximateLocation();
    const action = this.isLogin
      ? this.auth.login(email, password, rememberMe)
      : this.auth.register({ fullName, phoneNumber, email, password, acceptTerms, termsVersion: "2026-08-31", ...location });
    action.pipe(switchMap(() => this.auth.refresh()), finalize(() => this.loading.set(false))).subscribe({
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
