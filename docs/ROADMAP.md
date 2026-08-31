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
- logging HTTP estruturado com redaction por exclusão, ProblemDetails sanitizado, correlation ID validado, auditoria de autenticação/catálogo/mídia, proxy confiável e readiness de configuração implementados;
- Testcontainers e Playwright completo rodam na CI com Docker/PostgreSQL;
- Lighthouse ≥90, backup real, credenciais de produção e smoke pós-deploy continuam como gates externos antes do lançamento público.

## Estabilização e detalhe público — concluídos

- corrigir e cobrir regressões de navegação por categoria e persistência visual de logo/imagens;
- detalhe público clicável para cada produto, com URL estável e compartilhável;
- QR Code individual de produto com download PNG/SVG;

## Próximo ciclo

- integrar logs/alertas a um destino operacional e definir retenção dos registros de auditoria após escolher a infraestrutura de produção;
- adicionar personalização segura de tipografia, capa, espaçamentos, layout e componentes, sem CSS arbitrário;
- implementar foto de perfil da conta com storage, processamento e remoção explícita;
- criar página pública personalizável de apresentação do restaurante/empresa, separada do cardápio.

## Pós-MVP

- cobrança e planos comerciais;
- analytics por eventos;
- variações/adicionais e colaboração multiusuário avançada.
