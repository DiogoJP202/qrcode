import { Component, computed, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideHome, LucideRefreshCw } from "@lucide/angular";
import { BrandComponent } from "../../shared/brand.component";

const errors: Record<string, { eyebrow: string; title: string; text: string }> = {
  "403": { eyebrow: "Acesso negado", title: "Esta área não está disponível para sua conta.", text: "Confira se você entrou com a conta correta ou retorne à área administrativa." },
  "404": { eyebrow: "Página não encontrada", title: "Este endereço não existe — ou mudou de lugar.", text: "Revise o link ou volte ao início para continuar navegando." },
  "500": { eyebrow: "Erro inesperado", title: "Algo não saiu como planejado.", text: "Tente novamente. Se o problema continuar, envie o horário do erro ao suporte." },
  "503": { eyebrow: "Serviço indisponível", title: "Estamos fazendo uma breve manutenção.", text: "Aguarde alguns minutos e tente novamente." },
};

@Component({
  selector: "app-error-page",
  imports: [RouterLink, LucideArrowLeft, LucideHome, LucideRefreshCw, BrandComponent],
  template: `
    <main class="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f9f8] px-5 py-12"><div class="absolute -right-40 -top-40 size-[34rem] rounded-full bg-brand-200/40 blur-3xl"></div>
      <section class="relative w-full max-w-2xl text-center"><app-brand /><p class="mt-14 text-[clamp(6rem,24vw,12rem)] leading-none font-black tracking-[-.08em] text-brand-100">{{ code() }}</p><span class="eyebrow -mt-4 inline-block">{{ content().eyebrow }}</span><h1 class="mx-auto mt-5 max-w-xl text-4xl font-black tracking-[-.045em] sm:text-5xl">{{ content().title }}</h1><p class="mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-500">{{ content().text }}</p><div class="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><a routerLink="/" class="btn-primary btn-brand"><svg lucideHome size="18"></svg> Ir para o início</a><button type="button" class="btn-secondary" (click)="reload()"><svg lucideRefreshCw size="18"></svg> Tentar novamente</button></div><a routerLink="/contato" class="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-brand-700"><svg lucideArrowLeft size="15"></svg> Falar com o suporte</a></section>
    </main>
  `,
})
export class ErrorPage {
  private readonly route = inject(ActivatedRoute);
  readonly code = computed(() => String(this.route.snapshot.data["code"] ?? "404"));
  readonly content = computed(() => errors[this.code()] ?? errors["404"]);
  reload(): void { location.reload(); }
}
