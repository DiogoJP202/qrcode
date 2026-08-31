# Frontend

## Stack

Angular 22 com componentes standalone, TypeScript strict, signals para estado local, RxJS/HttpClient para I/O, typed reactive forms, Tailwind CSS 4, Angular CDK e Lucide.

Não usar NgRx no MVP. Estado vindo do servidor fica em services por feature; chamadas HTTP passam por uma camada central. Tipos de contratos são gerados do OpenAPI e não editados manualmente.

## Áreas

- marketing: `/`, `/sobre`, `/como-funciona`, `/clientes`, `/planos`, `/contato`;
- conta: `/login`, `/cadastro`, confirmação e recuperação;
- privado: `/app`, cardápios, produtos, aparência, loja, conta e plano;
- onboarding: `/app/onboarding` com retomada do passo incompleto;
- público: `/m/:slug`, lazy-loaded e mobile-first.

O próximo ciclo público adicionará uma página de apresentação personalizável da empresa e uma rota estável de detalhe para cada produto. Cards de produto serão clicáveis; a URL individual será também o destino do QR Code do item.

## Design system

Tokens próprios para cor, tipografia, espaçamento, radius, sombra e motion. Componentes base: botão, input, select, textarea, card, badge, dialog, dropdown, toast, skeleton, empty state, stepper e navegação.

O verde é identidade principal, combinado com neutros. Animações respeitam `prefers-reduced-motion` e duram em geral 120–240 ms.

## Responsividade e acessibilidade

Validar 375, 768, 1024 e 1440 px. O dashboard móvel usa header e navegação própria em vez de comprimir sidebar. HTML semântico, foco visível, labels, teclado e contraste são critérios de aceite.

## Performance

Rotas por feature são lazy-loaded. Imagens públicas usam thumbnail/srcset quando aplicável. Bundle budgets e Lighthouse fazem parte do gate de release.
