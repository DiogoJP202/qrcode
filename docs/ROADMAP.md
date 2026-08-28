# Roadmap

## Fase 0 — concluída

- auditoria, documentos e ADRs estão versionados e consistentes.

## Fase 1 — Foundation implementada

- solução .NET, Angular, PostgreSQL/Mailpit no Compose, OpenAPI, health checks, CI e builds verdes.

## Fase 2 — Identidade implementada

- cadastro, confirmação, login, logout, Google, recuperação, cookie e antiforgery testados.

## Fase 3 — Domínio e API implementados

- lojas, cardápios, categorias, produtos, ordenação, planos e ownership disponíveis em `/api/v1`.

## Fase 4 — Web e onboarding implementados

- landing curta, páginas institucionais, shell privado e fluxo até primeiro produto.

## Fase 5 — Mídia implementada

- logo e imagens com variantes WebP em storage local/S3-compatible.

## Fase 6 — Aparência e publicação implementadas

- editor, preview, publicação e cardápio público acessível e rápido.

## Fase 7 — Hardening com gate operacional

- suíte unitária/integração/UI verde, ownership/CSRF/upload cobertos, migrations verificadas e operação documentada;
- Testcontainers e Playwright completo rodam na CI com Docker/PostgreSQL;
- Lighthouse ≥90, backup real, credenciais de produção e smoke pós-deploy continuam como gates externos antes do lançamento público.

## Pós-MVP

- QR Code PNG/SVG;
- cobrança e planos comerciais;
- analytics por eventos;
- variações/adicionais e colaboração multiusuário avançada.
