import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowRight, LucideCheck, LucideCircleCheckBig, LucideQrCode, LucideSparkles } from "@lucide/angular";
import { SiteFooterComponent } from "../../shared/site-footer.component";
import { SiteHeaderComponent } from "../../shared/site-header.component";

@Component({
  selector: "app-landing-page",
  imports: [RouterLink, LucideArrowRight, LucideCheck, LucideCircleCheckBig, LucideQrCode, LucideSparkles, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="overflow-hidden bg-[#fbfcfb]">
      <section class="relative pt-34 pb-20 lg:pt-42 lg:pb-28">
        <div class="pointer-events-none absolute -top-30 right-[-18rem] size-[42rem] rounded-full bg-brand-200/45 blur-3xl"></div>
        <div class="pointer-events-none absolute left-[-15rem] top-[28rem] size-[28rem] rounded-full bg-amber-100/60 blur-3xl"></div>
        <div class="container-page relative grid items-center gap-14 lg:grid-cols-[1.03fr_.97fr]">
          <div>
            <div class="eyebrow"><svg lucideSparkles size="15" aria-hidden="true"></svg> Seu cardápio, sempre atualizado</div>
            <h1 class="mt-6 max-w-3xl text-[clamp(3.15rem,6.8vw,6.35rem)] leading-[.91] font-black tracking-[-.075em] text-ink">
              Um cardápio que <span class="text-brand-600">abre o apetite.</span>
            </h1>
            <p class="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">Crie, personalize e publique seu cardápio digital em minutos. Seus clientes acessam pelo celular — você atualiza quando quiser.</p>
            <div class="mt-9 flex flex-col gap-3 sm:flex-row">
              <a routerLink="/cadastro" class="btn-primary btn-brand px-6">Criar meu cardápio grátis <svg lucideArrowRight size="18" aria-hidden="true"></svg></a>
              <a routerLink="/exemplo" class="btn-secondary px-6">Ver um cardápio pronto</a>
              <a href="#como-funciona" class="btn-secondary px-6">Ver como funciona</a>
            </div>
            <div class="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
              <span class="flex items-center gap-2"><svg lucideCheck class="text-brand-600" size="17" aria-hidden="true"></svg> Sem cartão</span>
              <span class="flex items-center gap-2"><svg lucideCheck class="text-brand-600" size="17" aria-hidden="true"></svg> Fácil de editar</span>
              <span class="flex items-center gap-2"><svg lucideCheck class="text-brand-600" size="17" aria-hidden="true"></svg> Link permanente</span>
            </div>
          </div>

          <div class="relative mx-auto w-full max-w-[560px]" aria-label="Demonstração do cardápio no celular">
            <div class="absolute -left-8 top-18 z-10 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200 sm:block">
              <div class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><svg lucideCircleCheckBig size="20"></svg></span><span class="text-sm"><strong class="block text-ink">Publicado</strong><span class="text-slate-500">Pronto para compartilhar</span></span></div>
            </div>
            <div class="absolute -right-6 bottom-20 z-10 hidden rounded-2xl bg-ink p-4 text-white shadow-xl sm:block">
              <div class="flex items-center gap-3"><svg lucideQrCode size="32"></svg><span class="text-sm"><strong class="block">Aponte a câmera</strong><span class="text-white/60">Acesso instantâneo</span></span></div>
            </div>
            <div class="mx-auto w-[min(86vw,338px)] rounded-[3.2rem] border-[10px] border-[#15231d] bg-[#15231d] p-1 shadow-[0_40px_90px_rgba(15,38,27,.25)] rotate-[2deg]">
              <div class="overflow-hidden rounded-[2.45rem] bg-[#f8f6f0]">
                <div class="mx-auto mt-2 h-5 w-24 rounded-full bg-[#15231d]"></div>
                <div class="px-5 pt-6 pb-3 text-center">
                  <div class="mx-auto grid size-15 place-items-center rounded-full bg-[#163c2b] text-2xl">🌿</div>
                  <h2 class="mt-3 text-xl font-black tracking-tight">Casa Manjericão</h2>
                  <p class="mt-1 text-xs text-slate-500">Comida fresca, feita com carinho.</p>
                </div>
                <div class="flex gap-2 overflow-hidden px-4 py-3 text-[11px] font-bold"><span class="rounded-full bg-[#163c2b] px-4 py-2 text-white">Destaques</span><span class="rounded-full bg-white px-4 py-2">Entradas</span><span class="rounded-full bg-white px-4 py-2">Pratos</span></div>
                <div class="space-y-3 px-4 pb-8">
                  <h3 class="pt-2 text-sm font-black uppercase tracking-wider">Mais pedidos</h3>
                  @for (item of demoItems; track item.name) {
                    <article class="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                      <div class="grid size-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 text-4xl">{{ item.emoji }}</div>
                      <div class="min-w-0 py-1"><h4 class="text-sm font-extrabold">{{ item.name }}</h4><p class="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{{ item.description }}</p><p class="mt-2 text-sm font-black text-[#167048]">{{ item.price }}</p></div>
                    </article>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-y border-slate-200/80 bg-white py-7">
        <div class="container-page flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center text-sm font-bold text-slate-500">
          <span class="text-xs uppercase tracking-[.18em] text-slate-400">Ideal para</span><span>Restaurantes</span><span>Cafeterias</span><span>Bares</span><span>Docerias</span><span>Food trucks</span>
        </div>
      </section>

      <section id="como-funciona" class="py-24 lg:py-32">
        <div class="container-page">
          <div class="mx-auto max-w-2xl text-center"><span class="eyebrow">Simples de verdade</span><h2 class="mt-4 text-4xl font-black tracking-[-.045em] text-ink sm:text-5xl">Do primeiro item ao link publicado em poucos passos.</h2><p class="mt-5 text-lg leading-8 text-slate-600">Sem depender de designer, agência ou arquivos difíceis de atualizar.</p></div>
          <div class="mt-15 grid gap-5 md:grid-cols-3">
            @for (step of steps; track step.number) {
              <article class="surface relative overflow-hidden rounded-[1.7rem] p-7">
                <span class="absolute right-5 top-2 text-7xl font-black text-brand-100">{{ step.number }}</span>
                <div class="relative grid size-12 place-items-center rounded-2xl bg-brand-500 text-lg font-black text-white">{{ step.number }}</div>
                <h3 class="relative mt-8 text-xl font-black">{{ step.title }}</h3><p class="relative mt-3 leading-7 text-slate-600">{{ step.text }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="bg-ink py-24 text-white lg:py-28">
        <div class="container-page grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div><span class="eyebrow !text-brand-300">Feito para mudar</span><h2 class="mt-5 text-4xl font-black tracking-[-.045em] sm:text-5xl">Atualizou o preço? O cliente já vê.</h2><p class="mt-5 max-w-xl text-lg leading-8 text-white/65">Edite produtos, disponibilidade e aparência. O mesmo link continua funcionando — sem reimprimir nada.</p><a routerLink="/cadastro" class="btn-primary btn-brand mt-8">Começar agora <svg lucideArrowRight size="18"></svg></a></div>
          <div class="grid gap-4 sm:grid-cols-2">
            @for (benefit of benefits; track benefit.title) {
              <div class="rounded-[1.5rem] border border-white/10 bg-white/[.055] p-6"><svg lucideCheck class="text-brand-300" size="22"></svg><h3 class="mt-5 font-extrabold">{{ benefit.title }}</h3><p class="mt-2 text-sm leading-6 text-white/55">{{ benefit.text }}</p></div>
            }
          </div>
        </div>
      </section>

      <section class="py-24 lg:py-32">
        <div class="container-page grid gap-10 rounded-[2.2rem] bg-brand-100 px-7 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16">
          <div><span class="eyebrow">Plano gratuito</span><h2 class="mt-4 text-4xl font-black tracking-[-.045em]">Tudo para publicar seu primeiro cardápio.</h2><p class="mt-4 text-slate-600">Uma loja, um cardápio publicado e até 100 produtos. Sem cartão de crédito.</p></div>
          <a routerLink="/cadastro" class="btn-primary px-7">Criar conta grátis <svg lucideArrowRight size="18"></svg></a>
        </div>
      </section>
    </main>
    <app-site-footer />
  `,
})
export class LandingPage {
  readonly demoItems = [
    { emoji: "🥗", name: "Bowl da casa", description: "Folhas, legumes grelhados e molho cítrico", price: "R$ 34,90" },
    { emoji: "🍝", name: "Massa artesanal", description: "Molho de tomates assados e manjericão", price: "R$ 42,00" },
  ];
  readonly steps = [
    { number: "01", title: "Cadastre seu negócio", text: "Dê um nome ao cardápio e escolha seu endereço exclusivo." },
    { number: "02", title: "Monte e personalize", text: "Adicione categorias, produtos, preços, fotos e as cores da sua marca." },
    { number: "03", title: "Publique e compartilhe", text: "Seu link fica pronto para usar nas redes, no balcão e no QR Code." },
  ];
  readonly benefits = [
    { title: "Editor rápido", text: "Organize produtos e categorias sem planilhas ou arquivos." },
    { title: "Visual da sua marca", text: "Escolha cores, logo e estilo com preview imediato." },
    { title: "Celular em primeiro lugar", text: "Leitura clara, navegação leve e carregamento rápido." },
    { title: "Controle em um só lugar", text: "Disponibilidade, destaques e preços sempre sob controle." },
  ];
}
