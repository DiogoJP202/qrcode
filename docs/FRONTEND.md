# Frontend

## Stack

Angular 22 com componentes standalone, TypeScript strict, signals para estado local, RxJS/HttpClient para I/O, typed reactive forms, Tailwind CSS 4, Angular CDK e Lucide.

Não usar NgRx no MVP. Estado vindo do servidor fica em services por feature; chamadas HTTP passam por uma camada central. Tipos de contratos são gerados do OpenAPI e não editados manualmente.

## Áreas

- marketing: `/`, `/sobre`, `/como-funciona`, `/clientes`, `/planos`, `/contato`;
- conta: `/login`, `/cadastro`, `/cadastro-google`, confirmação, recuperação e perfil do responsável;
- legal: `/termos` e `/privacidade`, pré-renderizadas;
- privado: `/app`, cardápios, produtos, aparência, apresentação do negócio, central de QR Codes, loja, conta e plano;
- onboarding: `/app/onboarding` com retomada do passo incompleto;
- público: `/m/:slug`, `/p/:productId` e `/empresa/:slug`, lazy-loaded e mobile-first;
- erros: páginas próprias para 403, 404, 500 e 503, com wildcard global em 404.

Cards de produto são clicáveis e abrem uma rota individual estável, que também é o destino do QR Code PNG/SVG. A página do negócio reúne história, contatos, atendimento, links, identidade visual e acesso ao cardápio, e só fica pública após ação explícita do responsável.

## Design system

Tokens próprios para cor, tipografia, espaçamento, radius, sombra e motion. Componentes base: botão, input, select, textarea, card, badge, dialog, dropdown, toast, skeleton, empty state, stepper e navegação.

O verde é identidade principal, combinado com neutros. Animações respeitam `prefers-reduced-motion` e duram em geral 120–240 ms.

## Responsividade e acessibilidade

Validar 375, 768, 1024 e 1440 px. O dashboard móvel usa header e navegação própria em vez de comprimir sidebar. HTML semântico, foco visível, labels, teclado e contraste são critérios de aceite.

## Performance

Rotas por feature são lazy-loaded. Imagens públicas usam thumbnail/srcset quando aplicável. Bundle budgets e Lighthouse fazem parte do gate de release.
