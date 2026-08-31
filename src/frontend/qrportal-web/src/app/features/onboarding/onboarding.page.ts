import { CurrencyPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LucideArrowLeft, LucideArrowRight, LucideCheck, LucideExternalLink, LucideSparkles } from "@lucide/angular";
import { finalize } from "rxjs";
import { apiErrorMessage, ApiClient } from "../../core/api-client.service";
import { AuthService } from "../../core/auth.service";
import { Category, MenuDetails, Store, Theme } from "../../core/models";

const defaultTheme: Theme = { preset: "green", primaryColor: "#16A34A", secondaryColor: "#0F172A", backgroundColor: "#FFFFFF", style: "rounded", fontFamily: "sans", cardLayout: "grid", imageStyle: "cover" };

@Component({
  selector: "app-onboarding-page",
  imports: [CurrencyPipe, ReactiveFormsModule, LucideArrowLeft, LucideArrowRight, LucideCheck, LucideExternalLink, LucideSparkles],
  template: `
    <div class="mx-auto max-w-6xl">
      <header class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span class="eyebrow"><svg lucideSparkles size="15"></svg> Configuração guiada</span><h1 class="mt-2 text-3xl font-black tracking-tight">Prepare seu cardápio</h1><p class="mt-2 text-slate-500">Seu progresso é salvo a cada etapa.</p></div><span class="text-sm font-bold text-slate-400">Etapa {{ step() + 1 }} de {{ steps.length }}</span></header>
      <div class="mb-7 flex gap-2" aria-label="Progresso">@for (item of steps; track item; let i = $index) { <div class="h-1.5 flex-1 rounded-full" [class]="i <= step() ? 'bg-brand-500' : 'bg-slate-200'"></div> }</div>

      <div class="grid gap-7 lg:grid-cols-[1fr_390px]">
        <section class="surface rounded-3xl p-6 sm:p-9">
          @if (loadingInitial()) {
            <div class="skeleton h-8 w-52"></div><div class="skeleton mt-4 h-5 w-80"></div><div class="skeleton mt-9 h-13"></div><div class="skeleton mt-5 h-13"></div>
          } @else {
            @switch (step()) {
              @case (0) {
                <h2 class="text-2xl font-black">Como se chama seu negócio?</h2><p class="mt-2 text-slate-500">Esse nome será mostrado no topo do cardápio.</p>
                <form [formGroup]="storeForm" (ngSubmit)="saveStore()" class="mt-8"><label class="field-label">Nome público</label><input class="field" aria-label="Nome público" formControlName="publicName" placeholder="Ex.: Casa Manjericão" (input)="syncSlug(storeForm)" /><label class="field-label mt-5">Endereço da loja</label><div class="flex items-center rounded-[13px] border border-slate-200 bg-slate-50 focus-within:border-brand-500"><span class="pl-3 text-sm text-slate-400">qrportal.com/</span><input class="min-w-0 flex-1 border-0 bg-transparent px-1 py-3.5 outline-0" aria-label="Endereço da loja" formControlName="slug" placeholder="casa-manjericao" /></div><button class="btn-primary btn-brand mt-8" [disabled]="saving()">Salvar e continuar <svg lucideArrowRight size="18"></svg></button></form>
              }
              @case (1) {
                <h2 class="text-2xl font-black">Dê um nome ao cardápio</h2><p class="mt-2 text-slate-500">Pode ser “Cardápio principal”, “Almoço” ou o nome que fizer sentido.</p>
                <form [formGroup]="menuForm" (ngSubmit)="saveMenu()" class="mt-8"><label class="field-label">Nome do cardápio</label><input class="field" aria-label="Nome do cardápio" formControlName="name" placeholder="Ex.: Cardápio principal" (input)="syncSlug(menuForm)" /><label class="field-label mt-5">Link público</label><div class="flex items-center rounded-[13px] border border-slate-200 bg-slate-50 focus-within:border-brand-500"><span class="pl-3 text-sm text-slate-400">qrportal.com/m/</span><input class="min-w-0 flex-1 border-0 bg-transparent px-1 py-3.5 outline-0" aria-label="Link público" formControlName="slug" placeholder="casa-manjericao" /></div><button class="btn-primary btn-brand mt-8" [disabled]="saving()">Salvar e continuar <svg lucideArrowRight size="18"></svg></button></form>
              }
              @case (2) {
                <h2 class="text-2xl font-black">Crie a primeira categoria</h2><p class="mt-2 text-slate-500">Categorias ajudam o cliente a encontrar rapidamente o que procura.</p>
                <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="mt-8"><label class="field-label">Nome da categoria</label><input class="field" aria-label="Nome da categoria" formControlName="name" placeholder="Ex.: Pratos principais" /><label class="field-label mt-5">Descrição <span class="font-normal text-slate-400">(opcional)</span></label><textarea class="field min-h-24 resize-none" aria-label="Descrição da categoria" formControlName="description" placeholder="Uma breve descrição"></textarea><button class="btn-primary btn-brand mt-8" [disabled]="saving()">Criar categoria <svg lucideArrowRight size="18"></svg></button></form>
              }
              @case (3) {
                <h2 class="text-2xl font-black">Adicione seu primeiro produto</h2><p class="mt-2 text-slate-500">Você poderá incluir foto, destaque e mais detalhes no editor.</p>
                <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="mt-8"><label class="field-label">Nome do produto</label><input class="field" aria-label="Nome do produto" formControlName="name" placeholder="Ex.: Bowl da casa" /><label class="field-label mt-5">Descrição</label><textarea class="field min-h-24 resize-none" aria-label="Descrição do produto" formControlName="description" placeholder="Ingredientes e informações importantes"></textarea><label class="field-label mt-5">Preço</label><div class="flex items-center rounded-[13px] border border-slate-200"><span class="pl-3 text-sm font-bold text-slate-500">R$</span><input class="min-w-0 flex-1 border-0 bg-transparent px-2 py-3.5 outline-0" aria-label="Preço" type="number" min="0" step="0.01" formControlName="price" /></div><button class="btn-primary btn-brand mt-8" [disabled]="saving()">Adicionar produto <svg lucideArrowRight size="18"></svg></button></form>
              }
              @case (4) {
                <h2 class="text-2xl font-black">Escolha um ponto de partida</h2><p class="mt-2 text-slate-500">Você poderá ajustar cada cor depois no editor de aparência.</p>
                <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">@for (preset of presets; track preset.name) { <button type="button" class="rounded-2xl border-2 p-3 text-left transition" [class]="selectedPreset() === preset.name ? 'border-ink bg-slate-50' : 'border-slate-200 hover:border-slate-300'" (click)="selectPreset(preset)"><span class="block h-16 rounded-xl" [style.background]="preset.primary"></span><span class="mt-3 block text-sm font-extrabold">{{ preset.label }}</span></button> }</div>
                <button class="btn-primary btn-brand mt-8" (click)="saveAppearance()" [disabled]="saving()">Aplicar aparência <svg lucideArrowRight size="18"></svg></button>
              }
              @case (5) {
                <span class="grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700"><svg lucideCheck size="28" strokeWidth="3"></svg></span><h2 class="mt-6 text-3xl font-black">Está tudo pronto para publicar.</h2><p class="mt-3 max-w-xl leading-7 text-slate-500">Revise o preview. Para publicar, seu e-mail precisa estar confirmado pelo link enviado no cadastro.</p>
                @if (!auth.user()?.emailConfirmed) { <div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Confirme seu e-mail.</strong> No ambiente local, abra o Mailpit em <code>localhost:8025</code> e use o link recebido.</div> }
                <div class="mt-8 flex flex-wrap gap-3"><button class="btn-primary btn-brand" (click)="publish()" [disabled]="saving()">{{ saving() ? "Publicando..." : "Publicar cardápio" }} <svg lucideExternalLink size="18"></svg></button><button class="btn-secondary" (click)="step.set(4)"><svg lucideArrowLeft size="17"></svg> Voltar à aparência</button></div>
              }
            }
            @if (error()) { <div class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{{ error() }}</div> }
          }
        </section>

        <aside class="hidden lg:block"><div class="sticky top-24"><p class="mb-3 text-center text-xs font-extrabold uppercase tracking-widest text-slate-400">Preview ao vivo</p><div class="mx-auto w-[330px] rounded-[2.8rem] border-[9px] border-ink bg-ink p-1 shadow-2xl"><div class="min-h-[610px] overflow-hidden rounded-[2.1rem] px-4 pb-8" [style.background]="previewTheme().backgroundColor"><div class="mx-auto mt-2 h-5 w-23 rounded-full bg-ink"></div><div class="py-7 text-center"><div class="mx-auto grid size-14 place-items-center rounded-full text-2xl text-white" [style.background]="previewTheme().primaryColor">{{ storeForm.controls.publicName.value.charAt(0) || 'Q' }}</div><h3 class="mt-3 text-xl font-black" [style.color]="previewTheme().secondaryColor">{{ storeForm.controls.publicName.value || 'Seu negócio' }}</h3><p class="mt-1 text-xs text-slate-500">{{ menuForm.controls.name.value || 'Seu cardápio digital' }}</p></div><span class="inline-flex rounded-full px-4 py-2 text-xs font-extrabold text-white" [style.background]="previewTheme().primaryColor">{{ categoryForm.controls.name.value || 'Categoria' }}</span><article class="mt-4 rounded-2xl bg-white p-4 shadow-sm"><div class="h-28 rounded-xl bg-gradient-to-br from-brand-100 to-amber-100"></div><h4 class="mt-4 font-black" [style.color]="previewTheme().secondaryColor">{{ productForm.controls.name.value || 'Seu primeiro produto' }}</h4><p class="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{{ productForm.controls.description.value || 'A descrição aparecerá aqui para ajudar o cliente a escolher.' }}</p><p class="mt-4 font-black" [style.color]="previewTheme().primaryColor">{{ productForm.controls.price.value | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p></article></div></div></div></aside>
      </div>
    </div>
  `,
})
export class OnboardingPage {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiClient);
  private readonly router = inject(Router);
  readonly steps = ["Loja", "Cardápio", "Categoria", "Produto", "Aparência", "Publicar"];
  readonly step = signal(0);
  readonly saving = signal(false);
  readonly loadingInitial = signal(true);
  readonly error = signal<string | null>(null);
  readonly storeId = signal<string | null>(null);
  readonly menuId = signal<string | null>(null);
  readonly categoryId = signal<string | null>(null);
  readonly selectedPreset = signal("green");
  readonly previewTheme = signal<Theme>(defaultTheme);
  readonly presets = [
    { name: "green", label: "Verde", primary: "#16A34A", secondary: "#0F172A", background: "#F7FAF8" },
    { name: "red", label: "Vermelho", primary: "#DC2626", secondary: "#1F1720", background: "#FFF9F8" },
    { name: "blue", label: "Azul", primary: "#2563EB", secondary: "#172033", background: "#F7F9FF" },
    { name: "purple", label: "Roxo", primary: "#7C3AED", secondary: "#231832", background: "#FBF8FF" },
    { name: "orange", label: "Laranja", primary: "#EA580C", secondary: "#2D1C14", background: "#FFFAF6" },
    { name: "dark", label: "Dark", primary: "#22C55E", secondary: "#F8FAFC", background: "#111827" },
  ];
  readonly storeForm = new FormGroup({ publicName: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }), slug: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }) });
  readonly menuForm = new FormGroup({ name: new FormControl("Cardápio principal", { nonNullable: true, validators: [Validators.required] }), slug: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }) });
  readonly categoryForm = new FormGroup({ name: new FormControl("", { nonNullable: true, validators: [Validators.required] }), description: new FormControl("", { nonNullable: true }) });
  readonly productForm = new FormGroup({ name: new FormControl("", { nonNullable: true, validators: [Validators.required] }), description: new FormControl("", { nonNullable: true }), price: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }) });

  constructor() {
    this.auth.refresh().subscribe({
      next: (response) => {
        const state = response.onboarding; this.storeId.set(state.storeId); this.menuId.set(state.menuId); this.categoryId.set(state.categoryId);
        const mapped = { store: 0, menu: 1, category: 2, product: 3, appearance: 4, complete: 5 }[state.step] ?? 0;
        this.step.set(mapped); this.loadExisting(); this.loadingInitial.set(false);
      },
      error: (error) => { this.error.set(apiErrorMessage(error)); this.loadingInitial.set(false); },
    });
  }

  syncSlug(form: FormGroup): void {
    const raw = (form.get("publicName")?.value ?? form.get("name")?.value ?? "") as string;
    form.get("slug")?.setValue(raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), { emitEvent: false });
  }

  saveStore(): void {
    if (this.storeForm.invalid) { this.storeForm.markAllAsTouched(); return; }
    this.run(this.api.http.post<Store>(this.api.url("/stores"), { ...this.storeForm.getRawValue(), description: null }), (store) => { this.storeId.set(store.id); this.menuForm.controls.slug.setValue(store.slug); this.step.set(1); });
  }
  saveMenu(): void {
    if (this.menuForm.invalid || !this.storeId()) { this.menuForm.markAllAsTouched(); return; }
    this.run(this.api.http.post<MenuDetails>(this.api.url(`/stores/${this.storeId()}/menus`), { ...this.menuForm.getRawValue(), description: null }), (menu) => { this.menuId.set(menu.id); this.step.set(2); });
  }
  saveCategory(): void {
    if (this.categoryForm.invalid || !this.menuId()) { this.categoryForm.markAllAsTouched(); return; }
    this.run(this.api.http.post<Category>(this.api.url(`/menus/${this.menuId()}/categories`), this.categoryForm.getRawValue()), (category) => { this.categoryId.set(category.id); this.step.set(3); });
  }
  saveProduct(): void {
    if (this.productForm.invalid || !this.menuId() || !this.categoryId()) { this.productForm.markAllAsTouched(); return; }
    this.run(this.api.http.post(this.api.url(`/menus/${this.menuId()}/products`), { categoryId: this.categoryId(), ...this.productForm.getRawValue(), promotionalPrice: null }), () => this.step.set(4));
  }
  selectPreset(preset: typeof this.presets[number]): void { this.selectedPreset.set(preset.name); this.previewTheme.set({ ...this.previewTheme(), preset: preset.name, primaryColor: preset.primary, secondaryColor: preset.secondary, backgroundColor: preset.background }); }
  saveAppearance(): void { if (!this.menuId()) return; this.run(this.api.http.put<Theme>(this.api.url(`/menus/${this.menuId()}/theme`), this.previewTheme()), (theme) => { this.previewTheme.set(theme); this.step.set(5); }); }
  publish(): void { if (!this.menuId()) return; this.run(this.api.http.post<MenuDetails>(this.api.url(`/menus/${this.menuId()}/publish`), {}), (menu) => this.router.navigateByUrl(`/m/${menu.slug}`)); }

  private run<T>(request: import("rxjs").Observable<T>, success: (value: T) => void): void {
    this.saving.set(true); this.error.set(null);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({ next: success, error: (error) => this.error.set(apiErrorMessage(error)) });
  }
  private loadExisting(): void {
    if (this.storeId()) this.api.http.get<Store>(this.api.url(`/stores/${this.storeId()}`)).subscribe((store) => this.storeForm.patchValue({ publicName: store.publicName, slug: store.slug }));
    if (this.menuId()) this.api.http.get<MenuDetails>(this.api.url(`/menus/${this.menuId()}`)).subscribe((menu) => { this.menuForm.patchValue({ name: menu.name, slug: menu.slug }); this.previewTheme.set(menu.theme); this.selectedPreset.set(menu.theme.preset); const category = menu.categories[0]; if (category) { this.categoryForm.patchValue({ name: category.name, description: category.description ?? "" }); const product = category.products[0]; if (product) this.productForm.patchValue({ name: product.name, description: product.description ?? "", price: product.price }); } });
  }
}
