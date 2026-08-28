import { CurrencyPipe } from "@angular/common";
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { LucideCheck, LucideExternalLink, LucideGripVertical, LucideImagePlus, LucidePackagePlus, LucidePlus, LucideQrCode, LucideSave, LucideUpload } from "@lucide/angular";
import { catchError, finalize, of, switchMap } from "rxjs";
import { apiErrorMessage, ApiClient } from "../../core/api-client.service";
import { AuthService } from "../../core/auth.service";
import { Category, MenuDetails, MenuSummary, PagedResult, Product, Store, Theme } from "../../core/models";
import { MenuPreviewComponent } from "./menu-preview.component";

type EditorTab = "menu" | "products" | "appearance" | "qrcode" | "store" | "account" | "plan";

@Component({
  selector: "app-editor-page",
  imports: [CurrencyPipe, CdkDrag, CdkDropList, ReactiveFormsModule, LucideCheck, LucideExternalLink, LucideGripVertical, LucideImagePlus, LucidePackagePlus, LucidePlus, LucideQrCode, LucideSave, LucideUpload, MenuPreviewComponent],
  template: `
    <div class="mx-auto max-w-6xl">
      @if (loading()) {
        <div class="skeleton h-10 w-64"></div><div class="skeleton mt-7 h-[520px]"></div>
      } @else if (!menu() || !store()) {
        <section class="surface rounded-3xl p-10 text-center"><h1 class="text-2xl font-black">Crie seu cardápio primeiro</h1><p class="mt-3 text-slate-500">Use o onboarding guiado para montar a estrutura inicial.</p><a href="/app/onboarding" class="btn-primary btn-brand mt-6">Abrir onboarding</a></section>
      } @else {
        <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span class="eyebrow">Editor</span><h1 class="mt-2 text-3xl font-black tracking-tight">{{ tabTitle }}</h1><p class="mt-2 text-slate-500">{{ menu()?.name }} · {{ store()?.publicName }}</p></div><div class="flex gap-2"><span class="status-pill" [class]="menu()?.status === 'Published' ? 'bg-brand-100 text-brand-800' : 'bg-amber-100 text-amber-800'">{{ menu()?.status === "Published" ? "Publicado" : "Rascunho" }}</span>@if (menu()?.status === 'Published') { <a [href]="'/m/' + menu()?.slug" target="_blank" class="btn-secondary !min-h-9 !px-3 !py-1 text-xs">Abrir <svg lucideExternalLink size="14"></svg></a> }</div></header>
        @if (notice()) { <div class="mt-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800"><svg lucideCheck size="17"></svg>{{ notice() }}</div> }
        @if (error()) { <div class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{{ error() }}</div> }

        @switch (tab()) {
          @case ("menu") {
            <section class="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
              <form class="surface rounded-3xl p-6 sm:p-8" [formGroup]="menuForm" (ngSubmit)="saveMenu()"><h2 class="text-xl font-black">Informações do cardápio</h2><div class="mt-7"><label class="field-label">Nome</label><input class="field" aria-label="Nome do cardápio" formControlName="name" /></div><div class="mt-5"><label class="field-label">Descrição</label><textarea class="field min-h-28 resize-none" aria-label="Descrição do cardápio" formControlName="description"></textarea></div><div class="mt-5"><label class="field-label">Endereço público</label><div class="flex items-center rounded-[13px] border border-slate-200"><span class="pl-3 text-sm text-slate-400">qrportal.com/m/</span><input class="min-w-0 flex-1 border-0 bg-transparent px-1 py-3.5 outline-0" aria-label="Endereço público do cardápio" formControlName="slug" /></div></div><button class="btn-primary btn-brand mt-7" [disabled]="saving()"><svg lucideSave size="18"></svg> Salvar informações</button></form>
              <aside class="rounded-3xl bg-ink p-6 text-white"><p class="text-sm font-bold text-brand-300">Publicação</p><h2 class="mt-3 text-2xl font-black">{{ menu()?.status === "Published" ? "Seu link está no ar" : "Pronto para receber clientes?" }}</h2><p class="mt-3 text-sm leading-6 text-white/60">Para publicar, confirme o e-mail e mantenha pelo menos um produto disponível em categoria ativa.</p><button class="btn-primary btn-brand mt-7 w-full" (click)="publish()" [disabled]="saving()">{{ menu()?.status === "Published" ? "Republicar alterações" : "Publicar agora" }} <svg lucideExternalLink size="17"></svg></button></aside>
            </section>
          }
          @case ("products") {
            <section class="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">
              <div>
                <div class="surface rounded-3xl p-5 sm:p-7"><div class="flex items-center justify-between"><div><h2 class="text-xl font-black">Categorias e produtos</h2><p class="mt-1 text-sm text-slate-500">Arraste para reorganizar.</p></div><button class="btn-secondary !min-h-10 !px-3 text-sm" (click)="addingCategory.set(!addingCategory())"><svg lucidePlus size="17"></svg> Categoria</button></div>
                  @if (addingCategory()) { <form [formGroup]="categoryForm" (ngSubmit)="addCategory()" class="mt-5 flex gap-2 rounded-2xl bg-slate-50 p-3"><input class="field" aria-label="Nome da categoria" formControlName="name" placeholder="Nome da categoria" /><button class="btn-primary btn-brand !min-h-11 shrink-0">Adicionar</button></form> }
                  <div class="mt-6 space-y-4" cdkDropList [cdkDropListData]="menu()!.categories" (cdkDropListDropped)="dropCategory($event)">
                    @for (category of menu()?.categories; track category.id) {
                      <article cdkDrag class="rounded-2xl border border-slate-200 bg-white p-4"><div class="flex items-center gap-3"><button cdkDragHandle class="text-slate-300" aria-label="Arrastar categoria"><svg lucideGripVertical size="19"></svg></button><div class="min-w-0 flex-1"><h3 class="font-black">{{ category.name }}</h3><p class="text-xs text-slate-400">{{ category.products.length }} produto(s)</p></div><span class="status-pill" [class]="category.isActive ? 'bg-brand-50 text-brand-800' : 'bg-slate-100 text-slate-500'">{{ category.isActive ? "Ativa" : "Oculta" }}</span></div>
                        <div class="mt-4 space-y-2" cdkDropList [cdkDropListData]="category.products" (cdkDropListDropped)="dropProduct(category, $event)">
                          @for (product of category.products; track product.id) {
                            <div cdkDrag class="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><button cdkDragHandle class="text-slate-300" aria-label="Arrastar produto"><svg lucideGripVertical size="17"></svg></button><div class="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-slate-300">@if (product.thumbnailUrl) { <img [src]="product.thumbnailUrl" [alt]="product.name" class="size-full object-cover" /> } @else { <svg lucideImagePlus size="20"></svg> }</div><div class="min-w-0 flex-1"><p class="truncate text-sm font-extrabold">{{ product.name }}</p><p class="text-xs font-bold text-brand-700">{{ (product.promotionalPrice ?? product.price) | currency:'BRL' }}</p></div><label class="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold"><input type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" (change)="uploadProductImage(product, $event)" />Foto</label><button type="button" class="rounded-lg px-2.5 py-2 text-xs font-bold" [class]="product.isAvailable ? 'bg-brand-100 text-brand-800' : 'bg-slate-200 text-slate-500'" (click)="toggleProduct(product)">{{ product.isAvailable ? "Disponível" : "Indisponível" }}</button></div>
                          }
                        </div>
                      </article>
                    } @empty { <div class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Nenhuma categoria cadastrada.</div> }
                  </div>
                </div>
              </div>
              <form class="surface h-fit rounded-3xl p-6 xl:sticky xl:top-24" [formGroup]="productForm" (ngSubmit)="addProduct()"><span class="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700"><svg lucidePackagePlus size="22"></svg></span><h2 class="mt-5 text-xl font-black">Novo produto</h2><label class="field-label mt-6">Categoria</label><select class="field" aria-label="Categoria do produto" formControlName="categoryId">@for (category of menu()?.categories; track category.id) { <option [value]="category.id">{{ category.name }}</option> }</select><label class="field-label mt-4">Nome</label><input class="field" aria-label="Nome do produto" formControlName="name" placeholder="Nome do produto" /><label class="field-label mt-4">Descrição</label><textarea class="field min-h-20 resize-none" aria-label="Descrição do produto" formControlName="description"></textarea><div class="mt-4 grid grid-cols-2 gap-3"><div><label class="field-label">Preço</label><input class="field" aria-label="Preço do produto" type="number" min="0" step=".01" formControlName="price" /></div><div><label class="field-label">Promocional</label><input class="field" aria-label="Preço promocional" type="number" min="0" step=".01" formControlName="promotionalPrice" /></div></div><button class="btn-primary btn-brand mt-6 w-full" [disabled]="saving()"><svg lucidePlus size="18"></svg> Adicionar produto</button></form>
            </section>
          }
          @case ("appearance") {
            <section class="mt-7 grid gap-6 lg:grid-cols-[1fr_390px]">
              <form class="surface rounded-3xl p-6 sm:p-8" [formGroup]="themeForm" (ngSubmit)="saveTheme()"><h2 class="text-xl font-black">Identidade visual</h2><p class="mt-2 text-slate-500">Comece por um preset e ajuste os detalhes.</p><div class="mt-7 grid grid-cols-3 gap-3">@for (preset of presets; track preset.name) { <button type="button" class="rounded-2xl border-2 p-2 text-left" [class]="themeForm.controls.preset.value === preset.name ? 'border-ink' : 'border-slate-200'" (click)="applyPreset(preset)"><span class="block h-14 rounded-xl" [style.background]="preset.primary"></span><span class="mt-2 block text-xs font-extrabold">{{ preset.label }}</span></button> }</div><div class="mt-7 grid gap-4 sm:grid-cols-3"><label class="text-sm font-bold text-slate-600">Primária<input type="color" class="mt-2 h-12 w-full rounded-xl border border-slate-200 p-1" formControlName="primaryColor" /></label><label class="text-sm font-bold text-slate-600">Textos<input type="color" class="mt-2 h-12 w-full rounded-xl border border-slate-200 p-1" formControlName="secondaryColor" /></label><label class="text-sm font-bold text-slate-600">Fundo<input type="color" class="mt-2 h-12 w-full rounded-xl border border-slate-200 p-1" formControlName="backgroundColor" /></label></div><label class="field-label mt-6">Estilo dos elementos</label><select class="field" formControlName="style"><option value="rounded">Arredondado</option><option value="square">Reto</option><option value="pill">Cápsula</option></select><button class="btn-primary btn-brand mt-7"><svg lucideSave size="18"></svg> Salvar aparência</button></form>
              <app-menu-preview [menu]="menu()!" [theme]="themeForm.getRawValue()" />
            </section>
          }
          @case ("qrcode") {
            <section class="surface mt-7 grid gap-8 rounded-3xl p-7 md:grid-cols-[280px_1fr] md:items-center sm:p-10"><div class="mx-auto grid size-56 place-items-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><svg lucideQrCode class="text-ink" size="150" strokeWidth="1.35"></svg></div><div><span class="eyebrow">Seu acesso público</span><h2 class="mt-3 text-3xl font-black">Compartilhe o link hoje.</h2><p class="mt-4 leading-7 text-slate-500">O download e a personalização avançada do QR Code chegam após o MVP. Seu link permanente já está pronto para redes sociais e mensagens.</p><div class="mt-6 flex max-w-xl items-center gap-2 rounded-2xl bg-slate-50 p-3"><code class="min-w-0 flex-1 truncate text-sm">https://qrportal.com/m/{{ menu()?.slug }}</code><a [href]="'/m/' + menu()?.slug" target="_blank" class="btn-secondary !min-h-10 !px-3"><svg lucideExternalLink size="16"></svg></a></div></div></section>
          }
          @case ("store") {
            <section class="mt-7 grid gap-6 lg:grid-cols-[1fr_330px]"><form class="surface rounded-3xl p-6 sm:p-8" [formGroup]="storeForm" (ngSubmit)="saveStore()"><h2 class="text-xl font-black">Dados públicos da loja</h2><label class="field-label mt-7">Nome público</label><input class="field" aria-label="Nome público da loja" formControlName="publicName" /><label class="field-label mt-5">Descrição</label><textarea class="field min-h-28 resize-none" aria-label="Descrição da loja" formControlName="description"></textarea><label class="field-label mt-5">Slug da loja</label><input class="field" aria-label="Slug da loja" formControlName="slug" /><button class="btn-primary btn-brand mt-7"><svg lucideSave size="18"></svg> Salvar loja</button></form><aside class="surface h-fit rounded-3xl p-6"><h2 class="font-black">Logo</h2><div class="mt-5 grid aspect-square place-items-center overflow-hidden rounded-2xl bg-slate-50 text-5xl font-black text-brand-700">@if (store()?.logoUrl) { <img [src]="store()?.logoUrl" alt="Logo da loja" class="size-full object-contain" /> } @else { {{ store()?.publicName?.charAt(0) }} }</div><label class="btn-secondary mt-4 w-full cursor-pointer"><input type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" (change)="uploadLogo($event)" /><svg lucideUpload size="17"></svg> Enviar logo</label><p class="mt-3 text-xs leading-5 text-slate-400">JPEG, PNG ou WebP. Até 10 MB.</p></aside></section>
          }
          @case ("account") {
            <section class="surface mt-7 max-w-2xl rounded-3xl p-7 sm:p-9"><h2 class="text-xl font-black">Sua conta</h2><div class="mt-7 rounded-2xl bg-slate-50 p-5"><p class="text-xs font-bold uppercase tracking-wider text-slate-400">E-mail</p><p class="mt-2 font-extrabold">{{ auth.user()?.email }}</p></div><div class="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 p-5"><div><p class="font-extrabold">Confirmação de e-mail</p><p class="mt-1 text-sm text-slate-500">Necessária para publicar.</p></div><span class="status-pill" [class]="auth.user()?.emailConfirmed ? 'bg-brand-100 text-brand-800' : 'bg-amber-100 text-amber-800'">{{ auth.user()?.emailConfirmed ? "Confirmado" : "Pendente" }}</span></div></section>
          }
          @case ("plan") {
            <section class="surface mt-7 max-w-3xl rounded-3xl p-7 sm:p-9"><span class="eyebrow">Plano atual</span><div class="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h2 class="text-4xl font-black">Free</h2><p class="mt-2 text-slate-500">Tudo para validar seu primeiro cardápio digital.</p></div><p class="text-3xl font-black">R$ 0 <span class="text-sm font-semibold text-slate-400">/mês</span></p></div><div class="mt-8 grid gap-3 sm:grid-cols-3">@for (feature of ['1 loja', '1 cardápio publicado', 'Até 100 produtos']; track feature) { <div class="flex items-center gap-2 rounded-xl bg-brand-50 p-4 text-sm font-bold text-brand-900"><svg lucideCheck size="17"></svg>{{ feature }}</div> }</div><p class="mt-7 text-sm leading-6 text-slate-500">Planos pagos serão disponibilizados após a validação das regras comerciais. Nenhuma cobrança é realizada no MVP.</p></section>
          }
        }
      }
    </div>
  `,
})
export class EditorPage {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiClient);
  private readonly route = inject(ActivatedRoute);
  readonly tab = signal<EditorTab>("menu");
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly store = signal<Store | null>(null);
  readonly menu = signal<MenuDetails | null>(null);
  readonly addingCategory = signal(false);
  readonly presets = [
    { name: "green", label: "Verde", primary: "#16A34A", secondary: "#0F172A", background: "#FFFFFF" },
    { name: "red", label: "Vermelho", primary: "#DC2626", secondary: "#1F1720", background: "#FFF9F8" },
    { name: "blue", label: "Azul", primary: "#2563EB", secondary: "#172033", background: "#F7F9FF" },
    { name: "purple", label: "Roxo", primary: "#7C3AED", secondary: "#231832", background: "#FBF8FF" },
    { name: "orange", label: "Laranja", primary: "#EA580C", secondary: "#2D1C14", background: "#FFFAF6" },
    { name: "dark", label: "Dark", primary: "#22C55E", secondary: "#F8FAFC", background: "#111827" },
  ];
  readonly menuForm = new FormGroup({ name: new FormControl("", { nonNullable: true, validators: [Validators.required] }), description: new FormControl("", { nonNullable: true }), slug: new FormControl("", { nonNullable: true, validators: [Validators.required] }) });
  readonly storeForm = new FormGroup({ publicName: new FormControl("", { nonNullable: true, validators: [Validators.required] }), description: new FormControl("", { nonNullable: true }), slug: new FormControl("", { nonNullable: true, validators: [Validators.required] }) });
  readonly categoryForm = new FormGroup({ name: new FormControl("", { nonNullable: true, validators: [Validators.required] }) });
  readonly productForm = new FormGroup({ categoryId: new FormControl("", { nonNullable: true, validators: [Validators.required] }), name: new FormControl("", { nonNullable: true, validators: [Validators.required] }), description: new FormControl("", { nonNullable: true }), price: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }), promotionalPrice: new FormControl<number | null>(null) });
  readonly themeForm = new FormGroup({ preset: new FormControl("green", { nonNullable: true }), primaryColor: new FormControl("#16A34A", { nonNullable: true }), secondaryColor: new FormControl("#0F172A", { nonNullable: true }), backgroundColor: new FormControl("#FFFFFF", { nonNullable: true }), style: new FormControl<"rounded" | "square" | "pill">("rounded", { nonNullable: true }) });
  get tabTitle(): string { return { menu: "Cardápio", products: "Produtos", appearance: "Aparência", qrcode: "QR Code", store: "Loja", account: "Conta", plan: "Plano" }[this.tab()]; }

  constructor() {
    this.route.queryParamMap.subscribe((params) => { const tab = params.get("tab") as EditorTab | null; if (tab && ["menu", "products", "appearance", "qrcode", "store", "account", "plan"].includes(tab)) this.tab.set(tab); });
    this.load();
  }

  saveMenu(): void { const menu = this.menu(); if (!menu || this.menuForm.invalid) return; this.run(this.api.http.patch<MenuDetails>(this.api.url(`/menus/${menu.id}`), this.menuForm.getRawValue()), (updated) => this.setMenu(updated), "Informações salvas."); }
  saveStore(): void { const store = this.store(); if (!store || this.storeForm.invalid) return; this.run(this.api.http.patch<Store>(this.api.url(`/stores/${store.id}`), this.storeForm.getRawValue()), (updated) => { this.store.set(updated); this.storeForm.patchValue({ ...updated, description: updated.description ?? "" }); }, "Loja atualizada."); }
  publish(): void { const menu = this.menu(); if (!menu) return; this.run(this.api.http.post<MenuDetails>(this.api.url(`/menus/${menu.id}/publish`), {}), (updated) => this.setMenu(updated), "Cardápio publicado."); }
  addCategory(): void { const menu = this.menu(); if (!menu || this.categoryForm.invalid) return; this.run(this.api.http.post<Category>(this.api.url(`/menus/${menu.id}/categories`), { name: this.categoryForm.controls.name.value, description: null }), () => { this.categoryForm.reset(); this.addingCategory.set(false); this.reloadMenu(); }, "Categoria adicionada."); }
  addProduct(): void { const menu = this.menu(); if (!menu || this.productForm.invalid) { this.productForm.markAllAsTouched(); return; } this.run(this.api.http.post<Product>(this.api.url(`/menus/${menu.id}/products`), this.productForm.getRawValue()), () => { const categoryId = this.productForm.controls.categoryId.value; this.productForm.reset({ categoryId, name: "", description: "", price: 0, promotionalPrice: null }); this.reloadMenu(); }, "Produto adicionado."); }
  toggleProduct(product: Product): void { this.run(this.api.http.patch<Product>(this.api.url(`/products/${product.id}`), { name: product.name, description: product.description, price: product.price, promotionalPrice: product.promotionalPrice, isAvailable: !product.isAvailable, isFeatured: product.isFeatured }), () => this.reloadMenu(), "Disponibilidade atualizada."); }
  saveTheme(): void { const menu = this.menu(); if (!menu) return; this.run(this.api.http.put<Theme>(this.api.url(`/menus/${menu.id}/theme`), this.themeForm.getRawValue()), (theme) => this.menu.set({ ...menu, theme }), "Aparência salva."); }
  applyPreset(preset: typeof this.presets[number]): void { this.themeForm.patchValue({ preset: preset.name, primaryColor: preset.primary, secondaryColor: preset.secondary, backgroundColor: preset.background }); }
  dropCategory(event: CdkDragDrop<Category[]>): void { const menu = this.menu(); if (!menu || event.previousIndex === event.currentIndex) return; moveItemInArray(menu.categories, event.previousIndex, event.currentIndex); this.menu.set({ ...menu, categories: [...menu.categories] }); this.api.http.put(this.api.url(`/menus/${menu.id}/categories/order`), { items: menu.categories.map((category, order) => ({ id: category.id, order })) }).subscribe({ error: (error) => { this.error.set(apiErrorMessage(error)); this.reloadMenu(); } }); }
  dropProduct(category: Category, event: CdkDragDrop<Product[]>): void { const menu = this.menu(); if (!menu || event.previousIndex === event.currentIndex) return; moveItemInArray(category.products, event.previousIndex, event.currentIndex); this.menu.set({ ...menu, categories: [...menu.categories] }); const products = menu.categories.flatMap((item) => item.products.map((product, order) => ({ id: product.id, order }))); this.api.http.put(this.api.url(`/menus/${menu.id}/products/order`), { items: products }).subscribe({ error: (error) => { this.error.set(apiErrorMessage(error)); this.reloadMenu(); } }); }
  uploadProductImage(product: Product, event: Event): void { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; const body = new FormData(); body.append("file", file); this.run(this.api.http.put(this.api.url(`/products/${product.id}/image`), body), () => this.reloadMenu(), "Imagem processada e salva."); }
  uploadLogo(event: Event): void { const store = this.store(); const file = (event.target as HTMLInputElement).files?.[0]; if (!store || !file) return; const body = new FormData(); body.append("file", file); this.run(this.api.http.put<{ url: string }>(this.api.url(`/stores/${store.id}/logo`), body), (response) => this.store.set({ ...store, logoUrl: response.url }), "Logo atualizado."); }

  private load(): void {
    this.auth.refresh().pipe(switchMap(() => this.api.http.get<PagedResult<Store>>(this.api.url("/stores"))), switchMap((stores) => { const store = stores.items[0]; if (!store) return of<PagedResult<MenuSummary>>({ items: [], page: 1, pageSize: 20, total: 0 }); this.store.set(store); this.storeForm.patchValue({ publicName: store.publicName, slug: store.slug, description: store.description ?? "" }); return this.api.http.get<PagedResult<MenuSummary>>(this.api.url(`/stores/${store.id}/menus`)); }), switchMap((menus) => menus.items[0] ? this.api.http.get<MenuDetails>(this.api.url(`/menus/${menus.items[0].id}`)) : of(null)), catchError((error) => { this.error.set(apiErrorMessage(error)); return of(null); }), finalize(() => this.loading.set(false))).subscribe((menu) => { if (menu) this.setMenu(menu); });
  }
  private reloadMenu(): void { const menu = this.menu(); if (!menu) return; this.api.http.get<MenuDetails>(this.api.url(`/menus/${menu.id}`)).subscribe((updated) => this.setMenu(updated)); }
  private setMenu(menu: MenuDetails): void { this.menu.set(menu); this.menuForm.patchValue({ name: menu.name, slug: menu.slug, description: menu.description ?? "" }); this.themeForm.patchValue(menu.theme); if (!this.productForm.controls.categoryId.value && menu.categories[0]) this.productForm.controls.categoryId.setValue(menu.categories[0].id); }
  private run<T>(request: import("rxjs").Observable<T>, success: (value: T) => void, message: string): void { this.saving.set(true); this.error.set(null); this.notice.set(null); request.pipe(finalize(() => this.saving.set(false))).subscribe({ next: (value) => { success(value); this.notice.set(message); setTimeout(() => this.notice.set(null), 3500); }, error: (error) => this.error.set(apiErrorMessage(error)) }); }
}
