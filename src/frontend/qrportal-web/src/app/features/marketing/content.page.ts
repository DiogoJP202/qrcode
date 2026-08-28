import { Component, computed, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LucideArrowRight, LucideCheck } from "@lucide/angular";
import { SiteFooterComponent } from "../../shared/site-footer.component";
import { SiteHeaderComponent } from "../../shared/site-header.component";

const pages: Record<string, { eyebrow: string; title: string; intro: string; sections: { title: string; text: string }[] }> = {
  "sobre": { eyebrow: "Sobre o QRPortal", title: "Tecnologia simples para negócios que acontecem no mundo real.", intro: "O QRPortal nasceu para tirar o cardápio digital da lista de problemas de quem empreende.", sections: [{ title: "Clareza antes de recursos", text: "Construímos uma experiência direta: cadastrar, organizar, personalizar e publicar." }, { title: "Seu negócio, sua identidade", text: "A ferramenta se adapta à marca sem exigir conhecimento técnico." }, { title: "Base feita para crescer", text: "Segurança, isolamento de dados e uma arquitetura sustentável desde o início." }] },
  "como-funciona": { eyebrow: "Como funciona", title: "Seu cardápio online em cinco passos guiados.", intro: "O onboarding mostra exatamente o que falta e salva seu progresso a cada etapa.", sections: [{ title: "1. Nome e endereço", text: "Defina o nome público e um link fácil de compartilhar." }, { title: "2. Conteúdo", text: "Crie a primeira categoria e cadastre seus produtos." }, { title: "3. Aparência", text: "Aplique um preset, ajuste cores e acompanhe o preview." }, { title: "4. Revisão", text: "Confira como o cliente verá seu cardápio no celular." }, { title: "5. Publicação", text: "Confirme seu e-mail e publique. Mudanças futuras entram no ar na hora." }] },
  "clientes": { eyebrow: "Para quem é", title: "Do balcão da cafeteria ao salão do restaurante.", intro: "Uma base flexível para operações enxutas que precisam informar bem e mudar rápido.", sections: [{ title: "Restaurantes e bares", text: "Organize pratos, bebidas, destaques e itens indisponíveis." }, { title: "Cafeterias e docerias", text: "Apresente produtos com visual forte e preços sempre corretos." }, { title: "Food trucks e eventos", text: "Compartilhe um link leve que funciona em qualquer celular." }] },
  "planos": { eyebrow: "Planos", title: "Comece grátis. Valide antes de pagar.", intro: "O plano Free cobre o fluxo completo para colocar seu primeiro cardápio no ar.", sections: [{ title: "1 loja", text: "Mantenha o perfil público e a identidade do seu negócio." }, { title: "1 cardápio publicado", text: "Compartilhe uma URL permanente com seus clientes." }, { title: "Até 100 produtos", text: "Categorias, imagens, preços promocionais e disponibilidade." }] },
  "contato": { eyebrow: "Contato", title: "Vamos conversar sobre o seu cardápio.", intro: "Envie uma mensagem para contato@qrportal.com. No MVP, o suporte responde em até um dia útil.", sections: [{ title: "Dúvidas de uso", text: "Ajudamos com cadastro, organização do cardápio e publicação." }, { title: "Parcerias", text: "Agências e consultorias podem falar com nosso time comercial." }, { title: "Segurança", text: "Relatos responsáveis podem ser enviados para security@qrportal.com." }] },
};

@Component({
  selector: "app-content-page",
  imports: [RouterLink, LucideArrowRight, LucideCheck, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="min-h-[80vh] bg-[#fbfcfb] pt-34 pb-24">
      <div class="container-page">
        <section class="max-w-4xl"><span class="eyebrow">{{ content().eyebrow }}</span><h1 class="mt-6 text-[clamp(2.8rem,7vw,5.6rem)] leading-[.98] font-black tracking-[-.065em]">{{ content().title }}</h1><p class="mt-7 max-w-2xl text-xl leading-8 text-slate-600">{{ content().intro }}</p></section>
        <section class="mt-16 grid gap-5 md:grid-cols-3">
          @for (section of content().sections; track section.title) { <article class="surface rounded-3xl p-7"><svg lucideCheck class="text-brand-600" size="23"></svg><h2 class="mt-6 text-xl font-black">{{ section.title }}</h2><p class="mt-3 leading-7 text-slate-600">{{ section.text }}</p></article> }
        </section>
        <section class="mt-16 flex flex-col justify-between gap-6 rounded-3xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:p-10"><div><h2 class="text-2xl font-black">Pronto para começar?</h2><p class="mt-2 text-white/60">Seu primeiro cardápio pode estar online hoje.</p></div><a routerLink="/cadastro" class="btn-primary btn-brand shrink-0">Criar grátis <svg lucideArrowRight size="18"></svg></a></section>
      </div>
    </main>
    <app-site-footer />
  `,
})
export class ContentPage {
  private readonly route = inject(ActivatedRoute);
  readonly content = computed(() => pages[this.route.snapshot.data["page"]] ?? pages["sobre"]);
}
