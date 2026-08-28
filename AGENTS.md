# QRPortal

SaaS de cardápios digitais em monorepo. O protótipo React original está congelado em `legacy/prototype-react` e não deve ser usado como arquitetura da aplicação nova.

## Estrutura canônica

- `src/backend/QrPortal.Api` — controllers, middleware e composição ASP.NET Core;
- `src/backend/QrPortal.Application` — contratos e abstrações;
- `src/backend/QrPortal.Domain` — entidades e invariantes;
- `src/backend/QrPortal.Infrastructure` — EF Core, Identity, storage, mídia e SMTP;
- `src/frontend/qrportal-web` — Angular 22 standalone e Tailwind CSS 4;
- `tests` — xUnit unitário e integração/Testcontainers;
- `docs` — fonte de verdade arquitetural e ADRs;
- `legacy/prototype-react` — referência visual preservada.

## Comandos

```text
docker compose up -d postgres mailpit
dotnet run --project src/backend/QrPortal.Api --launch-profile http
pnpm web:start
pnpm build
pnpm test
pnpm web:e2e
```

O frontend local usa `http://localhost:4200` e encaminha `/api` para `http://localhost:5043`. O Mailpit usa `http://localhost:8025`.

## Regras de implementação

- Use C# nullable, UUID v7, UTC, contratos explícitos e ProblemDetails.
- Toda consulta privada deve filtrar membership de loja; IDs do cliente não provam ownership.
- Mutações web passam por cookie HttpOnly e antiforgery `X-CSRF-TOKEN`.
- Angular usa componentes standalone, signals para estado local, RxJS para I/O e typed reactive forms.
- Use Tailwind diretamente nos templates; tokens/globais ficam em `src/styles.css`.
- Tipos OpenAPI em `src/app/core/generated` são gerados; atualize com `pnpm contracts` enquanto a API local estiver ativa.
- Migrations são explícitas e nunca executadas automaticamente no startup de produção.
- Não introduza NgRx, MediatR, AutoMapper, microservices, CSS arbitrário ou secrets no repositório.

## Qualidade

Antes de entregar mudanças estruturais, rode build e testes de backend/frontend. Para mudanças visuais, valide 375, 768, 1024 e 1440 px. Atualize a documentação/ADR quando uma decisão arquitetural mudar.
