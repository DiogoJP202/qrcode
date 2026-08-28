import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LucideCheck, LucideLoaderCircle } from "@lucide/angular";
import { finalize } from "rxjs";
import { apiErrorMessage, ApiClient } from "../../core/api-client.service";
import { BrandComponent } from "../../shared/brand.component";

type ActionMode = "confirm" | "forgot" | "reset";

@Component({
  selector: "app-account-action-page",
  imports: [ReactiveFormsModule, RouterLink, LucideCheck, LucideLoaderCircle, BrandComponent],
  template: `
    <main class="grid min-h-screen place-items-center bg-[#f5f7f6] px-5 py-12"><section class="surface w-full max-w-md rounded-3xl p-7 text-center sm:p-10"><app-brand />
      @if (mode === "confirm") {
        @if (loading()) { <svg lucideLoaderCircle class="mx-auto mt-10 animate-spin text-brand-600" size="34"></svg><h1 class="mt-5 text-2xl font-black">Confirmando seu e-mail...</h1> }
        @else if (success()) { <span class="mx-auto mt-10 grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700"><svg lucideCheck size="27"></svg></span><h1 class="mt-5 text-2xl font-black">E-mail confirmado</h1><p class="mt-3 text-slate-500">Agora seu cardápio pode ser publicado.</p><a routerLink="/app/onboarding" class="btn-primary btn-brand mt-7 w-full">Continuar</a> }
        @else { <h1 class="mt-10 text-2xl font-black">Não foi possível confirmar</h1><p class="mt-3 text-slate-500">{{ error() }}</p><a routerLink="/login" class="btn-secondary mt-7 w-full">Voltar ao login</a> }
      } @else {
        <h1 class="mt-10 text-3xl font-black">{{ mode === "forgot" ? "Recupere sua senha" : "Defina uma nova senha" }}</h1><p class="mt-3 text-slate-500">{{ mode === "forgot" ? "Enviaremos um link se o e-mail estiver cadastrado." : "Use uma senha forte com pelo menos 10 caracteres." }}</p>
        @if (success()) { <span class="mx-auto mt-8 grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700"><svg lucideCheck size="27"></svg></span><p class="mt-4 font-bold">{{ mode === "forgot" ? "Confira sua caixa de entrada." : "Senha atualizada com sucesso." }}</p><a routerLink="/login" class="btn-primary btn-brand mt-7 w-full">Ir para o login</a> }
        @else { <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 text-left">@if (mode === "forgot") { <label class="field-label">E-mail</label><input class="field" aria-label="E-mail" type="email" formControlName="email" autocomplete="email" /> } @else { <label class="field-label">Nova senha</label><input class="field" aria-label="Nova senha" type="password" formControlName="password" autocomplete="new-password" /> }@if (error()) { <p class="mt-4 text-sm font-semibold text-red-700">{{ error() }}</p> }<button class="btn-primary btn-brand mt-6 w-full" [disabled]="loading()">{{ loading() ? "Aguarde..." : mode === "forgot" ? "Enviar instruções" : "Redefinir senha" }}</button></form> }
      }
    </section></main>
  `,
})
export class AccountActionPage {
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  readonly mode = this.route.snapshot.data["mode"] as ActionMode;
  readonly loading = signal(this.mode === "confirm");
  readonly success = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = new FormGroup({ email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }), password: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)] }) });

  constructor() {
    if (this.mode === "confirm") {
      const userId = this.route.snapshot.queryParamMap.get("userId"); const token = this.route.snapshot.queryParamMap.get("token");
      if (!userId || !token) { this.loading.set(false); this.error.set("Link incompleto ou inválido."); return; }
      this.api.http.post<void>(this.api.url("/auth/confirm-email"), { userId, token }).pipe(finalize(() => this.loading.set(false))).subscribe({ next: () => this.success.set(true), error: (error) => this.error.set(apiErrorMessage(error)) });
    }
  }

  submit(): void {
    this.error.set(null);
    if (this.mode === "forgot") {
      if (this.form.controls.email.invalid) { this.form.controls.email.markAsTouched(); return; }
      this.send(this.api.http.post(this.api.url("/auth/forgot-password"), { email: this.form.controls.email.value }));
      return;
    }
    if (this.form.controls.password.invalid) { this.form.controls.password.markAsTouched(); return; }
    const userId = this.route.snapshot.queryParamMap.get("userId"); const token = this.route.snapshot.queryParamMap.get("token");
    if (!userId || !token) { this.error.set("Link incompleto ou inválido."); return; }
    this.send(this.api.http.post(this.api.url("/auth/reset-password"), { userId, token, newPassword: this.form.controls.password.value }));
  }

  private send(request: import("rxjs").Observable<unknown>): void { this.loading.set(true); request.pipe(finalize(() => this.loading.set(false))).subscribe({ next: () => this.success.set(true), error: (error) => this.error.set(apiErrorMessage(error)) }); }
}
