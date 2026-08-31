import { Component, computed, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideShieldCheck } from "@lucide/angular";
import { SiteFooterComponent } from "../../shared/site-footer.component";
import { SiteHeaderComponent } from "../../shared/site-header.component";

interface LegalSection { title: string; paragraphs: string[]; items?: string[]; }

const terms: LegalSection[] = [
  { title: "1. Aceite e elegibilidade", paragraphs: ["Ao criar uma conta, você declara ter capacidade legal para contratar e aceita esta versão dos Termos de Uso. O aceite fica registrado com data, versão e dados técnicos mínimos para comprovação.", "Se você utiliza o QRPortal em nome de uma empresa, declara possuir autorização para representá-la."] },
  { title: "2. O serviço", paragraphs: ["O QRPortal oferece ferramentas para cadastrar, personalizar e publicar páginas de negócio, cardápios digitais, produtos e QR Codes.", "Recursos, limites e disponibilidade podem variar conforme o plano. Alterações materiais serão comunicadas com antecedência razoável sempre que possível."] },
  { title: "3. Conta e segurança", paragraphs: ["Você deve fornecer dados corretos, manter suas credenciais protegidas e comunicar imediatamente qualquer uso não autorizado. A conta é pessoal e não deve ser compartilhada fora das permissões disponibilizadas pelo serviço."] },
  { title: "4. Conteúdo do cliente", paragraphs: ["Você mantém a responsabilidade por textos, imagens, preços, marcas, dados de contato e demais conteúdos publicados."], items: ["Não publique conteúdo ilegal, enganoso ou que viole direitos de terceiros.", "Garanta possuir autorização para usar imagens, marcas e dados pessoais inseridos.", "Mantenha preços, disponibilidade e informações do negócio atualizados."] },
  { title: "5. Uso aceitável", paragraphs: ["É proibido tentar contornar limites, acessar dados de outras contas, explorar vulnerabilidades, distribuir malware, automatizar abuso ou usar o serviço para fraude e atividades ilícitas."] },
  { title: "6. Suspensão e encerramento", paragraphs: ["Podemos limitar ou suspender contas em caso de risco de segurança, violação destes Termos ou exigência legal. Você poderá solicitar o encerramento da conta e a exportação ou eliminação dos dados aplicáveis pelos canais informados na Política de Privacidade."] },
  { title: "7. Disponibilidade e responsabilidade", paragraphs: ["Buscamos manter o serviço disponível e seguro, mas não garantimos operação ininterrupta. Na extensão permitida pela lei, não respondemos por perdas decorrentes de conteúdo incorreto publicado pelo cliente, serviços de terceiros ou indisponibilidades fora de nosso controle."] },
  { title: "8. Contato e alterações", paragraphs: ["Dúvidas podem ser enviadas para contato@qrportal.com. A versão vigente é identificada pela data abaixo; novo aceite poderá ser solicitado quando houver alteração relevante."] },
];

const privacy: LegalSection[] = [
  { title: "1. Dados tratados", paragraphs: ["Tratamos os dados necessários para prestar e proteger o serviço."], items: ["Conta: nome completo, telefone, e-mail, credenciais protegidas e status de confirmação.", "Negócio: nome público, conteúdo, contatos, imagens e configurações que você decidir publicar.", "Segurança: IP, horários, correlation IDs e eventos de autenticação e auditoria.", "Aceite: versão dos documentos, data, IP e, somente com sua escolha e permissão do navegador, localização aproximada."] },
  { title: "2. Finalidades", paragraphs: ["Usamos os dados para criar e administrar a conta, executar o serviço contratado, publicar o conteúdo solicitado, prestar suporte, prevenir fraude, investigar incidentes e comprovar aceite e operações relevantes."] },
  { title: "3. Localização opcional", paragraphs: ["A localização não é necessária para criar a conta. Quando você marcar a opção e permitir no navegador, armazenamos coordenadas arredondadas para reduzir a precisão. A recusa ou indisponibilidade não impede o cadastro."] },
  { title: "4. Compartilhamento", paragraphs: ["Dados podem ser processados por provedores necessários à operação, como hospedagem, PostgreSQL, storage S3, e-mail e autenticação Google. Não vendemos dados pessoais. Compartilhamentos adicionais ocorrerão apenas quando necessários ao serviço, exigidos por lei ou autorizados por você."] },
  { title: "5. Retenção e segurança", paragraphs: ["Mantemos dados enquanto a conta estiver ativa e pelo período necessário para obrigações legais, segurança e exercício de direitos. Aplicamos controle de acesso, criptografia em trânsito, cookies HttpOnly, auditoria e isolamento por negócio."] },
  { title: "6. Seus direitos", paragraphs: ["Você pode solicitar confirmação de tratamento, acesso, correção, portabilidade quando aplicável, informação sobre compartilhamentos, oposição, revogação de consentimento e eliminação nos limites legais. Solicitações devem ser enviadas para privacidade@qrportal.com."] },
  { title: "7. Atualizações", paragraphs: ["Mudanças relevantes serão apresentadas de forma clara e poderão exigir novo aceite. A versão vigente está indicada nesta página."] },
];

@Component({
  selector: "app-legal-page",
  imports: [RouterLink, LucideArrowLeft, LucideShieldCheck, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="min-h-screen bg-[#fbfcfb] pt-32 pb-20"><article class="container-page max-w-4xl">
      <a routerLink="/" class="inline-flex items-center gap-2 text-sm font-extrabold text-brand-700"><svg lucideArrowLeft size="16"></svg> Voltar ao início</a>
      <div class="mt-8 flex items-start gap-4"><span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700"><svg lucideShieldCheck size="24"></svg></span><div><span class="eyebrow">Documento legal</span><h1 class="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{{ title() }}</h1><p class="mt-3 text-sm font-semibold text-slate-500">Versão 2026-08-31 · Atualizado em 31 de agosto de 2026</p></div></div>
      <p class="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-5 leading-7 text-brand-950">{{ introduction() }}</p>
      <div class="mt-10 space-y-9">@for (section of sections(); track section.title) { <section><h2 class="text-xl font-black">{{ section.title }}</h2>@for (paragraph of section.paragraphs; track paragraph) { <p class="mt-3 leading-7 text-slate-600">{{ paragraph }}</p> }@if (section.items) { <ul class="mt-4 space-y-2 pl-5 text-slate-600">@for (item of section.items; track item) { <li class="list-disc pl-1 leading-7">{{ item }}</li> }</ul> }</section> }</div>
      <div class="mt-12 flex flex-wrap gap-3"><a routerLink="/termos" class="btn-secondary">Termos de Uso</a><a routerLink="/privacidade" class="btn-secondary">Política de Privacidade</a><a routerLink="/cadastro" class="btn-primary btn-brand">Criar conta</a></div>
    </article></main>
    <app-site-footer />
  `,
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);
  readonly isPrivacy = computed(() => this.route.snapshot.data["document"] === "privacy");
  readonly title = computed(() => this.isPrivacy() ? "Política de Privacidade" : "Termos de Uso");
  readonly introduction = computed(() => this.isPrivacy()
    ? "Esta política explica, de forma objetiva, quais dados o QRPortal trata, para quais finalidades e quais escolhas você possui."
    : "Estes termos regulam o uso do QRPortal. Leia com atenção antes de criar sua conta e publicar conteúdo.");
  readonly sections = computed(() => this.isPrivacy() ? privacy : terms);
}
